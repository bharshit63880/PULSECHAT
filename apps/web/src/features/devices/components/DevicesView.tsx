import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, ShieldCheck, Smartphone, TriangleAlert } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

import { Button } from '@/components/common/Button';
import { EmptyState } from '@/components/common/EmptyState';
import { Skeleton } from '@/components/common/Skeleton';
import { devicesApi } from '@/features/devices/api';

export const DevicesView = () => {
  const queryClient = useQueryClient();
  const devicesQuery = useQuery({
    queryKey: ['devices'],
    queryFn: devicesApi.list
  });

  const revokeMutation = useMutation({
    mutationFn: devicesApi.revoke,
    onSuccess: () => {
      toast.success('Device session revoked');
      void queryClient.invalidateQueries({ queryKey: ['devices'] });
    },
    onError: () => {
      toast.error('Unable to revoke that device');
    }
  });

  return (
    <div className="safe-px safe-pt safe-pb min-h-screen">
      <div className="mx-auto max-w-5xl rounded-3xl glass-panel p-5 sm:p-6 lg:p-8">
        <div className="flex flex-col gap-5 border-b border-line/80 pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Link to="/">
              <Button variant="ghost" className="h-11 w-11 rounded-2xl p-0">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <p className="text-xs font-semibold text-accent">SETTINGS</p>
              <h1 className="mt-1 text-3xl font-semibold tracking-[-0.04em]">Devices</h1>
              <p className="mt-2 text-sm leading-6 text-muted">Review where you are signed in and remove anything you do not recognise.</p>
            </div>
          </div>
          <div className="rounded-[26px] surface-muted px-4 py-3 text-sm text-muted">
            Keep this list tidy to protect your account.
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="glass-card rounded-[28px] p-5">
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent-soft text-accent dark:text-emerald-200">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-semibold">Private messages</h2>
                <p className="text-xs text-muted">Your direct-message privacy settings</p>
              </div>
            </div>
            <p className="text-sm leading-6 text-muted">
              Direct messages use the app's encrypted messaging flow. Compare safety numbers when you need extra assurance.
            </p>
          </div>
          <div className="glass-card rounded-[28px] p-5">
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 dark:bg-amber-950/35 dark:text-amber-300">
                <TriangleAlert className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-semibold">Keep access safe</h2>
                <p className="text-xs text-muted">Sign out of devices you no longer use</p>
              </div>
            </div>
            <p className="text-sm leading-6 text-muted">
              If a device is unfamiliar, remove it right away and sign in again on your trusted devices.
            </p>
          </div>
        </div>

        <div className="mt-6">
          {devicesQuery.isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-32 rounded-[28px]" />
              <Skeleton className="h-32 rounded-[28px]" />
            </div>
          ) : devicesQuery.data && devicesQuery.data.length > 0 ? (
            <div className="space-y-4">
              {devicesQuery.data.map((device) => (
                <section key={device.id} className="glass-card rounded-[30px] p-5">
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-soft text-accent dark:text-emerald-200">
                          <Smartphone className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold tracking-tight">{device.label}</h3>
                          <p className="text-sm text-muted">
                            {device.platform ?? 'Unknown platform'}
                            {device.isCurrent ? ' • Current device' : ''}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-2 rounded-[24px] surface-muted p-4">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">Fingerprint</p>
                        <p className="break-all font-mono text-xs leading-6 text-ink">{device.fingerprint}</p>
                        <p className="text-xs text-muted">Last active: {new Date(device.lastActiveAt).toLocaleString()}</p>
                      </div>
                    </div>

                    {!device.isCurrent ? (
                      <Button
                        variant="secondary"
                        onClick={() => revokeMutation.mutate(device.deviceId)}
                        disabled={revokeMutation.isPending}
                        className="min-h-11 rounded-2xl lg:min-w-[150px]"
                      >
                        Revoke session
                      </Button>
                    ) : (
                      <span className="inline-flex min-h-11 items-center justify-center rounded-2xl bg-accent-soft px-4 text-sm font-semibold text-accent dark:text-emerald-200">
                        Current session
                      </span>
                    )}
                  </div>
                </section>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No device sessions"
              description="Once you sign in from additional devices they will appear here for review and revocation."
            />
          )}
        </div>
      </div>
    </div>
  );
};
