'use client';

import { useSession } from 'next-auth/react';
import { format } from 'date-fns';
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
import { ParameterEdit } from '@/components/parameters/parameter-edit';
import { AddParameterDialog } from '@/components/parameters/add-parameter-dialog';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';

// Add type definitions for the data
type ParameterType =
  | 'weight'
  | 'bloodPressureSystolic'
  | 'bloodPressureDiastolic'
  | 'bloodSugar'
  | 'heartRate';

type Parameter = {
  id: string;
  patient_id: string;
  parameter: ParameterType;
  value: number;
  unit: string;
  notes: string | null;
  created_at: string;
};

type ParametersByType = {
  [key in ParameterType]?: Parameter[];
};

const parameterConfig = {
  weight: {
    title: 'Weight',
    description: 'Measured in kilograms (kg)',
    min: 0,
    max: 500,
    step: 0.1,
    color: '#2563eb',
  },
  bloodPressureSystolic: {
    title: 'Blood Pressure (Systolic)',
    description: 'Measured in mmHg',
    min: 0,
    max: 300,
    step: 1,
    color: '#2563eb',
  },
  bloodPressureDiastolic: {
    title: 'Blood Pressure (Diastolic)',
    description: 'Measured in mmHg',
    min: 0,
    max: 200,
    step: 1,
    color: '#7c3aed',
  },
  bloodSugar: {
    title: 'Blood Sugar',
    description: 'Measured in mg/dL',
    min: 0,
    max: 500,
    step: 1,
    color: '#2563eb',
  },
  heartRate: {
    title: 'Heart Rate',
    description: 'Beats per minute (BPM)',
    min: 0,
    max: 300,
    step: 1,
    color: '#2563eb',
  },
};

export default function ParametersPage() {
  const { data: session } = useSession();
  const [parameters, setParameters] = useState<ParametersByType>({});
  const [isLoading, setIsLoading] = useState(true);

  const fetchParameters = async () => {
    try {
      const response = await fetch('/api/parameters');
      if (!response.ok) {
        throw new Error('Failed to fetch parameters');
      }

      const data: Parameter[] = await response.json();

      // Group parameters by type
      const grouped = data.reduce((acc, param) => {
        if (!acc[param.parameter]) {
          acc[param.parameter] = [];
        }
        acc[param.parameter]!.push(param);
        return acc;
      }, {} as ParametersByType);

      // Sort each group by created_at
      Object.keys(grouped).forEach((type) => {
        grouped[type as ParameterType]?.sort(
          (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
      });

      setParameters(grouped);
    } catch (error) {
      console.error('Error fetching parameters:', error);
      toast.error('Failed to fetch parameters');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      fetchParameters();
    }
  }, [session]);

  const handleUpdateParameter = async (type: ParameterType, value: number, unit: string) => {
    try {
      const response = await fetch('/api/parameters', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          parameter: type,
          value,
          unit,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update parameter');
      }

      await fetchParameters();
      return Promise.resolve();
    } catch (error) {
      console.error('Error updating parameter:', error);
      return Promise.reject(error);
    }
  };

  const handleAddParameter = async (parameter: {
    parameter: string;
    value: number;
    unit: string;
    notes?: string | null;
  }) => {
    try {
      const response = await fetch('/api/parameters', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(parameter),
      });

      if (!response.ok) {
        throw new Error('Failed to add parameter');
      }

      await fetchParameters();
      return Promise.resolve();
    } catch (error) {
      console.error('Error adding parameter:', error);
      return Promise.reject(error);
    }
  };

  const getLatestValue = (type: ParameterType) => {
    const values = parameters[type];
    return values && values.length > 0 ? values[values.length - 1].value : 0;
  };

  const getLatestUnit = (type: ParameterType) => {
    const values = parameters[type];
    return values && values.length > 0 ? values[values.length - 1].unit : parameterConfig[type].description.split(' ').pop()?.replace(/[()]/g, '');
  };

  if (!session) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Health Parameters</h1>
          <p className="text-muted-foreground">
            Track and monitor your health metrics
          </p>
        </div>
        <AddParameterDialog onAdd={handleAddParameter} />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Weight Chart */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{parameterConfig.weight.title}</CardTitle>
                <CardDescription>{parameterConfig.weight.description}</CardDescription>
              </div>
              <ParameterEdit
                value={getLatestValue('weight')}
                unit={getLatestUnit('weight') || 'kg'}
                onSave={(value, unit) => handleUpdateParameter('weight', value, unit)}
                min={parameterConfig.weight.min}
                max={parameterConfig.weight.max}
                step={parameterConfig.weight.step}
                parameter="weight"
              />
            </div>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={parameters.weight}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="created_at"
                  tickFormatter={(date) => format(new Date(date), 'MMM d')}
                />
                <YAxis domain={['auto', 'auto']} />
                <Tooltip
                  labelFormatter={(date) => ""}
                  formatter={(value: number) => [
                    `${value.toFixed(1)} ${getLatestUnit('weight')}`,
                    'Weight',
                  ]}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={parameterConfig.weight.color}
                  strokeWidth={2}
                  dot={{ fill: parameterConfig.weight.color }}
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
              <div className="flex flex-col gap-2">
                <ParameterEdit
                  value={getLatestValue('bloodPressureSystolic')}
                  unit={getLatestUnit('bloodPressureSystolic') || 'mmHg'}
                  onSave={(value, unit) => handleUpdateParameter('bloodPressureSystolic', value, unit)}
                  min={parameterConfig.bloodPressureSystolic.min}
                  max={parameterConfig.bloodPressureSystolic.max}
                  step={parameterConfig.bloodPressureSystolic.step}
                  parameter="bloodPressureSystolic"
                />
                <ParameterEdit
                  value={getLatestValue('bloodPressureDiastolic')}
                  unit={getLatestUnit('bloodPressureDiastolic') || 'mmHg'}
                  onSave={(value, unit) => handleUpdateParameter('bloodPressureDiastolic', value, unit)}
                  min={parameterConfig.bloodPressureDiastolic.min}
                  max={parameterConfig.bloodPressureDiastolic.max}
                  step={parameterConfig.bloodPressureDiastolic.step}
                  parameter="bloodPressureDiastolic"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart>
                <CartesianGrid strokeDasharray="3 3" />
                
                <Tooltip
                  labelFormatter={(date) => ""}
                  formatter={(value: number, name: string) => [
                    `${value} mmHg`,
                    name.toLowerCase() === 'systolic' ? 'Systolic' : 'Diastolic',
                  ]}
                />
                {parameters.bloodPressureSystolic && (
                  <Line
                    data={parameters.bloodPressureSystolic}
                    type="monotone"
                    dataKey="value"
                    stroke={parameterConfig.bloodPressureSystolic.color}
                    strokeWidth={2}
                    dot={{ fill: parameterConfig.bloodPressureSystolic.color }}
                    name="Systolic"
                  />
                )}
                {parameters.bloodPressureDiastolic && (
                  <Line
                    data={parameters.bloodPressureDiastolic}
                    type="monotone"
                    dataKey="value"
                    stroke={parameterConfig.bloodPressureDiastolic.color}
                    strokeWidth={2}
                    dot={{ fill: parameterConfig.bloodPressureDiastolic.color }}
                    name="Diastolic"
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Blood Sugar Chart */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{parameterConfig.bloodSugar.title}</CardTitle>
                <CardDescription>{parameterConfig.bloodSugar.description}</CardDescription>
              </div>
              <ParameterEdit
                value={getLatestValue('bloodSugar')}
                unit={getLatestUnit('bloodSugar') || 'mg/dL'}
                onSave={(value, unit) => handleUpdateParameter('bloodSugar', value, unit)}
                min={parameterConfig.bloodSugar.min}
                max={parameterConfig.bloodSugar.max}
                step={parameterConfig.bloodSugar.step}
                parameter="bloodSugar"
              />
            </div>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={parameters.bloodSugar}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="created_at"
                  tickFormatter={(date) => format(new Date(date), 'MMM d')}
                />
                <YAxis domain={['auto', 'auto']} />
                <Tooltip
                  labelFormatter={(date) => ""}
                  formatter={(value: number) => [
                    `${value} ${getLatestUnit('bloodSugar')}`,
                    'Blood Sugar',
                  ]}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={parameterConfig.bloodSugar.color}
                  strokeWidth={2}
                  dot={{ fill: parameterConfig.bloodSugar.color }}
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
                <CardTitle>{parameterConfig.heartRate.title}</CardTitle>
                <CardDescription>{parameterConfig.heartRate.description}</CardDescription>
              </div>
              <ParameterEdit
                value={getLatestValue('heartRate')}
                unit={getLatestUnit('heartRate') || 'BPM'}
                onSave={(value, unit) => handleUpdateParameter('heartRate', value, unit)}
                min={parameterConfig.heartRate.min}
                max={parameterConfig.heartRate.max}
                step={parameterConfig.heartRate.step}
                parameter="heartRate"
              />
            </div>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={parameters.heartRate}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="created_at"
                  tickFormatter={(date) => format(new Date(date), 'MMM d')}
                />
                <YAxis domain={['auto', 'auto']} />
                <Tooltip
                  labelFormatter={(date) => ""}
                  formatter={(value: number) => [
                    `${value} ${getLatestUnit('heartRate')}`,
                    'Heart Rate',
                  ]}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={parameterConfig.heartRate.color}
                  strokeWidth={2}
                  dot={{ fill: parameterConfig.heartRate.color }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 