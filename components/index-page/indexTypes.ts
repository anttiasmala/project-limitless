export type FolderApp = {
  name: string;
  icon: string;
  href: string;
};

export type Folder = {
  name: string;
  icon: string;
  items: FolderApp[];
};

export type WindowModal = {
  uuid: string;
  isOpen: boolean;
  zIndex: number;
  top: number;
  left: number;
  modalName: string;
  modalIcon: string;
  items: FolderApp[];
};
