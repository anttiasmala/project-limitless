import Image from 'next/image';
import { MouseEvent, Ref } from 'react';
import Button from '../../shared/Button';

type Props = {
  // Label under the icon. the desktop tracks selection and
  // double-taps with the name, so it has to be unique among the desktop icons.
  name: string;
  icon: string;
  isSelected: boolean;
  // Registers the button with the desktop, so the marquee can select it.
  ref?: Ref<HTMLButtonElement>;
  onSelect: () => void;
  // Called on every click/tap with the event timestamp. The desktop decides
  // whether that is the second tap of a double-tap and opens the app.
  onActivate: (now: number) => void;
  onContextMenu: (e: MouseEvent<HTMLButtonElement>) => void;
};

// One app shortcut on the desktop (Notepad, Paint, CMD...). Folder icons are
// still rendered by Index in Index.tsx itself. Only the app shortcuts use this.
export default function DesktopAppIcon({
  name,
  icon,
  isSelected,
  ref,
  onSelect,
  onActivate,
  onContextMenu,
}: Props) {
  return (
    <Button
      ref={ref}
      variant="unstyled"
      className="flex cursor-default flex-col items-center"
      onMouseDown={(e) => {
        // Select just this icon. Stop the press from starting a marquee /
        // clearing the selection on the desktop.
        e.stopPropagation();
        onSelect();
      }}
      onContextMenu={onContextMenu}
      onClick={(e) => onActivate(e.timeStamp)}
    >
      <Image
        alt={`${name} icon`}
        src={icon}
        width={32}
        height={32}
        className={isSelected ? 'opacity-50' : ''}
      />
      <span
        className={`text-sm ${isSelected ? 'bg-[#0b61ff] text-white' : ''}`}
      >
        {name}
      </span>
    </Button>
  );
}
