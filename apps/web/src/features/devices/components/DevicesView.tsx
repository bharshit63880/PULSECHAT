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
      <div className="mx-auto max-w-5xl rounded-[36px] glass-panel p-5 sm:p-6 lg:p-8">
        <div className="flex flex-col gap-5 border-b border-line/80 pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Link to="/">
              <Button variant="ghost" className="h-11 w-11 rounded-2xl p-0">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted">Devices and security</p>
              <h1 className="mt-1 text-3xl font-semibold tracking-[-0.04em]">Session trust across your devices</h1>
              <p className="mt-2 text-sm leading-6 text-muted">Review browser/device sessions, fingerprints, and revoke stale access when needed.</p>
            </div>
          </div>
          <div className="rounded-[26px] surface-muted px-4 py-3 text-sm text-muted">
            The API stores public keys and delivery metadata only for direct E2EE sessions.
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="glass-card rounded-[28px] p-5">
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent-soft text-accent dark:text-emerald-200">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-semibold">Trust model</h2>
                <p className="text-xs text-muted">Client-side encryption, server-side delivery</p>
              </div>
            </div>
            <p className="text-sm leading-6 text-muted">
              Direct messages are encrypted on the client. The backend stores ciphertext, public key bundles, and message delivery metadata only.
            </p>
          </div>
          <div className="glass-card rounded-[28px] p-5">
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 dark:bg-amber-950/35 dark:text-amber-300">
                <TriangleAlert className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-semibold">Recovery seam</h2>
                <p className="text-xs text-muted">Future lock-screen hardening</p>
              </div>
            </div>
            <p className="text-sm leading-6 text-muted">
              This build keeps a clear architecture seam for biometrics or a local passcode gate, even though it is not enforced yet.
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
