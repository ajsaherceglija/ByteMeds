'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Stethoscope, Search, User, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import Link from 'next/link';
import { getConsultations, Consultation } from './actions';

export default function ConsultationsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadConsultations() {
      try {
        const data = await getConsultations();
        setConsultations(data);
      } catch (error) {
        console.error('Failed to load consultations:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadConsultations();
  }, []);

  const filteredConsultations = consultations.filter(consultation =>
    consultation.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    consultation.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Consultations</h1>
        <p className="text-muted-foreground">
          View your upcoming and past consultations
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Consultations</CardTitle>
          <CardDescription>
            {isLoading ? 'Loading...' : `${filteredConsultations.length} consultations found`}
          </CardDescription>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                placeholder="Search consultations..."
                className="w-full rounded-md border border-input pl-8 pr-2 py-2 text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredConsultations.map((consultation) => (
                <TableRow key={consultation.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{consultation.patientName}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Stethoscope className="h-4 w-4 text-muted-foreground" />
                      <span>{consultation.type}</span>
                    </div>
                  </TableCell>
                  <TableCell>{format(new Date(consultation.date), 'PPP p')}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{consultation.duration} mins</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                        consultation.status === 'scheduled'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-green-100 text-green-700'
                      }`}
                    >
                      {consultation.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/doctor-dashboard/consultations/${consultation.id}`}>
                        View Details
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {!isLoading && filteredConsultations.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                    No consultations found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
} 