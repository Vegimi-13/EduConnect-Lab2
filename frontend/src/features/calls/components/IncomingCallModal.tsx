import { Phone, PhoneOff } from "lucide-react";

interface IncomingCallModalProps {
  callerName: string;
  callerAvatar?: string;
  onAccept: () => void;
  onReject: () => void;
}

export default function IncomingCallModal({
  callerName,
  callerAvatar,
  onAccept,
  onReject,
}: IncomingCallModalProps) {
  const initials = callerName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="flex w-72 flex-col items-center gap-5 rounded-2xl border border-[#dde4e8] bg-white px-8 py-8 shadow-2xl">
        {/* Pulsing avatar */}
        <div className="animate-pulse">
          {callerAvatar ? (
            <img
              src={callerAvatar}
              alt={callerName}
              className="size-20 rounded-full border-2 border-[#073f43] object-cover"
            />
          ) : (
            <div className="flex size-20 items-center justify-center rounded-full border-2 border-[#073f43] bg-[#073f43] text-2xl font-bold text-white">
              {initials}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="text-center">
          <p className="text-xs font-medium uppercase tracking-widest text-[#8a9a9c]">
            Incoming call
          </p>
          <p className="mt-1 text-lg font-semibold text-[#101820]">{callerName}</p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-6">
          <button
            onClick={onReject}
            className="flex size-14 items-center justify-center rounded-full bg-red-600 text-white shadow-md shadow-red-200 transition hover:bg-red-700 active:scale-95"
            title="Decline"
          >
            <PhoneOff className="size-5" />
          </button>

          <button
            onClick={onAccept}
            className="flex size-14 items-center justify-center rounded-full bg-[#073f43] text-white shadow-md shadow-[#073f43]/30 transition hover:bg-[#062f33] active:scale-95"
            title="Accept"
          >
            <Phone className="size-5" />
          </button>
        </div>
      </div>
    </div>
  );
}