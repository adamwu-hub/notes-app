'use client';

interface ImageModalProps {
  url: string;
  onClose: () => void;
}

export default function ImageModal({ url, onClose }: ImageModalProps) {
  return (
    <div className="modal" onClick={onClose}>
      <img src={url} className="modal-content" onClick={(e) => e.stopPropagation()} />
    </div>
  );
}
