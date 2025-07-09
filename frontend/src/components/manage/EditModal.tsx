import React from "react";

interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const EditModal: React.FC<EditModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl w-full max-w-lg shadow-lg">
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <h2 className="font-semibold text-lg">{title}</h2>
          <button onClick={onClose} aria-label="Schließen" className="text-gray-500 hover:text-gray-700">✕</button>
        </div>
        <div className="p-6 max-h-[80vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};

export default EditModal; 