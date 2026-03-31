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
    <div className="min-h-screen p-4">
      <div className="mx-auto max-w-4xl rounded-[36px] border border-white/50 bg-white/70 p-6 shadow-soft backdrop-blur dark:border-white/5 dark:bg-slate-950/70">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/">
              <Button variant="ghost">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">Devices and Security</h1>
              <p className="text-sm text-muted">Review active devices, fingerprints, and revoke stale sessions.</p>
            </div>
          </div>
        </div>

        <div className="mb-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-[28px] border border-line p-5">
            <div className="mb-3 flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-accent" />
              <h2 className="font-semibold">Trust model</h2>
            </div>
            <p className="text-sm text-muted">
              Direct messages are encrypted in the browser. The server stores ciphertext, device public keys, and delivery metadata only.
            </p>
          </div>
          <div className="rounded-[28px] border border-line p-5">
            <div className="mb-3 flex items-center gap-3">
              <TriangleAlert className="h-5 w-5 text-amber-500" />
              <h2 className="font-semibold">Local lock placeholder</h2>
            </div>
            <p className="text-sm text-muted">
              This build keeps a dedicated architecture seam for a future passcode or biometrics gate, but it is not enforced yet.
            </p>
          </div>
        </div>

        {devicesQuery.isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-28 rounded-[28px]" />
            <Skeleton className="h-28 rounded-[28px]" />
          </div>
        ) : devicesQuery.data && devicesQuery.data.length > 0 ? (
          <div className="space-y-3">
            {devicesQuery.data.map((device) => (
              <section key={device.id} className="rounded-[28px] border border-line p-5">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <Smartphone className="h-5 w-5 text-accent" />
                      <div>
                        <h3 className="font-semibold">{device.label}</h3>
                        <p className="text-xs text-muted">
                          {device.platform ?? 'Unknown platform'} {device.isCurrent ? '• Current device' : ''}
                        </p>
                      </div>
                    </div>
                    <p className="break-all text-xs text-muted">Fingerprint: {device.fingerprint}</p>
                    <p className="text-xs text-muted">Last active: {new Date(device.lastActiveAt).toLocaleString()}</p>
                  </div>
                  {!device.isCurrent ? (
                    <Button
                      variant="secondary"
                      onClick={() => revokeMutation.mutate(device.deviceId)}
                      disabled={revokeMutation.isPending}
                    >
                      Revoke session
                    </Button>
                  ) : (
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-200">
                      Current
                    </span>
                  )}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No device sessions"
            description="Once you log in from additional devices they will appear here for review."
          />
        )}
      </div>
    </div>
  );
};
