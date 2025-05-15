'use client';

import { useSession } from 'next-auth/react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Plus } from 'lucide-react';

// Add type definitions for the mock data
type ParameterReading = {
  date: string;
  value: number;
};

type BloodPressureReading = {
  date: string;
  systolic: number;
  diastolic: number;
};

// Mock data - replace with actual API calls
const mockParameters = {
  weight: [
    { date: '2024-03-01', value: 75.5 },
    { date: '2024-03-05', value: 75.2 },
    { date: '2024-03-10', value: 74.8 },
    { date: '2024-03-15', value: 74.5 },
  ] as ParameterReading[],
  bloodPressure: [
    { date: '2024-03-01', systolic: 120, diastolic: 80 },
    { date: '2024-03-05', systolic: 118, diastolic: 78 },
    { date: '2024-03-10', systolic: 122, diastolic: 82 },
    { date: '2024-03-15', systolic: 119, diastolic: 79 },
  ] as BloodPressureReading[],
  bloodSugar: [
    { date: '2024-03-01', value: 95 },
    { date: '2024-03-05', value: 98 },
    { date: '2024-03-10', value: 92 },
    { date: '2024-03-15', value: 94 },
  ] as ParameterReading[],
  heartRate: [
    { date: '2024-03-01', value: 72 },
    { date: '2024-03-05', value: 75 },
    { date: '2024-03-10', value: 70 },
    { date: '2024-03-15', value: 73 },
  ],
};

export default function ParametersPage() {
  //const { data: session } = useSession();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Health Parameters</h1>
          <p className="text-muted-foreground">
            Track and monitor your health metrics
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Log New Parameters
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Weight Chart */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Weight</CardTitle>
                <CardDescription>Measured in kilograms (kg)</CardDescription>
              </div>
              <div className="text-2xl font-bold">
                {mockParameters.weight[mockParameters.weight.length - 1].value} kg
              </div>
            </div>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockParameters.weight}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(date) => format(new Date(date), 'MMM d')}
                />
                <YAxis domain={['auto', 'auto']} />
                <Tooltip
                  labelFormatter={(date) => format(new Date(date), 'PPP')}
                  formatter={(value) => [`${value} kg`, 'Weight']}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#2563eb"
                  strokeWidth={2}
                  dot={{ fill: '#2563eb' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Blood Pressure Chart */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Blood Pressure</CardTitle>
                <CardDescription>Systolic/Diastolic (mmHg)</CardDescription>
              </div>
              <div className="text-2xl font-bold">
                {
                  mockParameters.bloodPressure[
                    mockParameters.bloodPressure.length - 1
                  ].systolic
                }
                /
                {
                  mockParameters.bloodPressure[
                    mockParameters.bloodPressure.length - 1
                  ].diastolic
                }{' '}
                mmHg
              </div>
            </div>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockParameters.bloodPressure}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(date) => format(new Date(date), 'MMM d')}
                />
                <YAxis domain={['auto', 'auto']} />
                <Tooltip
                  labelFormatter={(date) => format(new Date(date), 'PPP')}
                  formatter={(value, name) => [
                    `${value} mmHg`,
                    name === 'systolic' ? 'Systolic' : 'Diastolic',
                  ]}
                />
                <Line
                  type="monotone"
                  dataKey="systolic"
                  stroke="#2563eb"
                  strokeWidth={2}
                  dot={{ fill: '#2563eb' }}
                  name="Systolic"
                />
                <Line
                  type="monotone"
                  dataKey="diastolic"
                  stroke="#7c3aed"
                  strokeWidth={2}
                  dot={{ fill: '#7c3aed' }}
                  name="Diastolic"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Blood Sugar Chart */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Blood Sugar</CardTitle>
                <CardDescription>Measured in mg/dL</CardDescription>
              </div>
              <div className="text-2xl font-bold">
                {mockParameters.bloodSugar[mockParameters.bloodSugar.length - 1].value}{' '}
                mg/dL
              </div>
            </div>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockParameters.bloodSugar}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(date) => format(new Date(date), 'MMM d')}
                />
                <YAxis domain={['auto', 'auto']} />
                <Tooltip
                  labelFormatter={(date) => format(new Date(date), 'PPP')}
                  formatter={(value) => [`${value} mg/dL`, 'Blood Sugar']}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#2563eb"
                  strokeWidth={2}
                  dot={{ fill: '#2563eb' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Heart Rate Chart */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Heart Rate</CardTitle>
                <CardDescription>Beats per minute (BPM)</CardDescription>
              </div>
              <div className="text-2xl font-bold">
                {mockParameters.heartRate[mockParameters.heartRate.length - 1].value}{' '}
                BPM
              </div>
            </div>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockParameters.heartRate}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(date) => format(new Date(date), 'MMM d')}
                />
                <YAxis domain={['auto', 'auto']} />
                <Tooltip
                  labelFormatter={(date) => format(new Date(date), 'PPP')}
                  formatter={(value) => [`${value} BPM`, 'Heart Rate']}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#2563eb"
                  strokeWidth={2}
                  dot={{ fill: '#2563eb' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 