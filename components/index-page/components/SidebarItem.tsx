import Image from 'next/image';

type Props = {
  icon: string;
  label: string;
};

export default function SidebarItem({ icon, label }: Props) {
  return (
    <button
      type="button"
      className="group flex w-full items-center gap-2 py-0.5 text-left"
    >
      <Image
        alt=""
        src={icon}
        width={16}
        height={16}
        className="h-4 w-4 shrink-0"
      />
      <span className="text-[11px] text-[#0c327d] group-hover:underline">
        {label}
      </span>
    </button>
  );
}
