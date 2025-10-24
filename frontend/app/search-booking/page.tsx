"use client";

import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  FileDown,
  Search,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Loader2,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

interface Timestamp {
  eventTypeCode: string;
  eventDateTime: string;
}

interface VesselSchedule {
  vessel: { name: string };
  servicePartners?: { carrierServiceName?: string }[];
  timestamps?: Timestamp[];
}

interface ScheduleItem {
  location?: { locationName?: string; UNLocationCode?: string };
  vesselSchedules?: VesselSchedule[];
}

export default function SearchBookingPage() {
  const today = new Date().toISOString().split("T")[0];

  const [port, setPort] = useState("TRGEM");
  const [date, setDate] = useState(today);
  const [loading, setLoading] = useState(false);
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedTerm, setDebouncedTerm] = useState("");
  const [selectedPort, setSelectedPort] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const pageSize = 10;

  // Debounce (500ms)
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedTerm(searchTerm), 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const searchSchedules = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(
        `http://localhost:4000/api/schedules?UNLocationCode=${port}&date=${date}`
      );
      const data = await res.json();

      if (Array.isArray(data) && data.length > 0) {
        setSchedules(data);
      } else {
        setSchedules([]);
        setError("No schedules found for this selection.");
      }
    } catch (e: any) {
      console.error(e);
      setError("Error fetching schedules");
    } finally {
      setLoading(false);
      setPage(1);
    }
  };

  const flattenedData = useMemo(() => {
    const rows: any[] = [];
    schedules.forEach((loc) => {
      loc.vesselSchedules?.forEach((vs) => {
        rows.push({
          port: loc.location?.locationName || "N/A",
          unloc: loc.location?.UNLocationCode || "N/A",
          vessel: vs.vessel?.name || "N/A",
          service: vs.servicePartners?.[0]?.carrierServiceName || "N/A",
          arrival:
            vs.timestamps?.find((t) => t.eventTypeCode === "ARRI")
              ?.eventDateTime || "",
          departure:
            vs.timestamps?.find((t) => t.eventTypeCode === "DEPA")
              ?.eventDateTime || "",
          details: vs.timestamps || [],
        });
      });
    });

    const filtered = rows.filter((r) => {
      const term = debouncedTerm.toLowerCase();
      return (
        r.vessel.toLowerCase().includes(term) ||
        r.service.toLowerCase().includes(term)
      );
    });

    if (sortBy) {
      filtered.sort((a, b) => {
        const valA = a[sortBy]?.toString() || "";
        const valB = b[sortBy]?.toString() || "";
        return sortOrder === "asc"
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);
      });
    }

    return filtered;
  }, [schedules, sortBy, sortOrder, debouncedTerm]);

  const paginatedData = flattenedData.slice((page - 1) * pageSize, page * pageSize);

  const toggleSort = (key: string) => {
    if (sortBy === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(key);
      setSortOrder("asc");
    }
  };

  const openDetails = (row: any) => {
    setSelectedPort(row);
    setShowModal(true);
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-2">Search Bookings</h1>
      <p className="text-zinc-600 mb-8 max-w-2xl">
        Search vessel schedules by <b>port</b> and <b>date</b>. You can view,
        sort, search, and download the data as Excel.
      </p>

      {/* Search form */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex flex-col">
          <Label>UN Location Code</Label>
          <Input
            value={port}
            onChange={(e) => setPort(e.target.value.toUpperCase())}
            placeholder="e.g. TRGEM"
            className="w-48"
          />
        </div>
        <div className="flex flex-col">
          <Label>Date</Label>
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-48"
          />
        </div>
        <div className="flex items-end gap-3">
          <Button onClick={searchSchedules} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Loading...
              </>
            ) : (
              <>
                <Search className="w-4 h-4 mr-2" /> Search
              </>
            )}
          </Button>
          <a
            href={`http://localhost:4000/api/schedules/excel?UNLocationCode=${port}&date=${date}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="secondary">
              <FileDown className="w-4 h-4 mr-2" /> Download Excel
            </Button>
          </a>
        </div>
      </div>

      {/* Filter */}
      {schedules.length > 0 && (
        <div className="mb-6 max-w-md relative">
          <Label>Search in results (Vessel / Service)</Label>
          <Input
            placeholder="Type to filter results..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
          />
          {searchTerm && (
            <X
              className="absolute right-3 top-9 w-4 h-4 text-zinc-500 cursor-pointer hover:text-black"
              onClick={() => setSearchTerm("")}
            />
          )}
        </div>
      )}

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-zinc-200 shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-zinc-100/60">
              {[
                { key: "port", label: "Port" },
                { key: "unloc", label: "UN Code" },
                { key: "vessel", label: "Vessel" },
                { key: "service", label: "Service" },
                { key: "arrival", label: "Arrival" },
                { key: "departure", label: "Departure" },
              ].map((col) => (
                <TableHead
                  key={col.key}
                  className="cursor-pointer select-none"
                  onClick={() => toggleSort(col.key)}
                >
                  {col.label}
                  {sortBy === col.key && (
                    <ArrowUpDown
                      className={`inline w-3 h-3 ml-1 ${
                        sortOrder === "asc" ? "rotate-180" : ""
                      }`}
                    />
                  )}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-6">
                  <Loader2 className="inline w-4 h-4 animate-spin mr-2" />
                  Loading...
                </TableCell>
              </TableRow>
            ) : paginatedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-6 text-zinc-500">
                  No results found
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((row, i) => (
                <TableRow key={i}>
                  <TableCell
                    onClick={() => openDetails(row)}
                    className="cursor-pointer text-blue-600 hover:underline"
                  >
                    {row.port}
                  </TableCell>
                  <TableCell>{row.unloc}</TableCell>
                  <TableCell>{row.vessel}</TableCell>
                  <TableCell>{row.service}</TableCell>
                  <TableCell>{row.arrival}</TableCell>
                  <TableCell>{row.departure}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {!loading && flattenedData.length > 0 && (
        <div className="flex justify-between items-center mt-6">
          <Button
            variant="outline"
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            <ChevronLeft className="w-4 h-4 mr-1" /> Prev
          </Button>
          <span>
            Page {page} of {Math.ceil(flattenedData.length / pageSize)}
          </span>
          <Button
            variant="outline"
            disabled={page * pageSize >= flattenedData.length}
            onClick={() => setPage(page + 1)}
          >
            Next <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      )}

      {/* Modal for Port Details */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedPort?.port}</DialogTitle>
            <DialogDescription>
              UN Code: {selectedPort?.unloc} — Vessel: {selectedPort?.vessel}
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 space-y-2 text-sm">
            {selectedPort?.details?.length ? (
              selectedPort.details.map((t: any, i: number) => (
                <div
                  key={i}
                  className="flex justify-between border-b border-zinc-200 py-1"
                >
                  <span className="font-medium">{t.eventTypeCode}</span>
                  <span>{t.eventDateTime}</span>
                </div>
              ))
            ) : (
              <p className="text-zinc-500">No timestamp details available.</p>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowModal(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
