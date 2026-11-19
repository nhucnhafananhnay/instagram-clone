import { useEffect, type MouseEvent, type ReactNode } from "react";
import { Icon } from "@/components/ui/Icon";

interface ModalProps {
  title: string;
  close: () => void;
  children: ReactNode;
  wide?: boolean;
}

export function Modal({ title, close, children, wide = false }: ModalProps) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") close();
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [close]);

  function handleBackdropClick(event: MouseEvent<HTMLDivElement>) {
    if (event.target === event.currentTarget) {
      close();
    }
  }

  return (
    <div className="modal-backdrop" onMouseDown={handleBackdropClick}>
      <section
        className={`modal ${wide ? "wide" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <header>
          {title === "Tạo bài viết mới" ? (
            <span />
          ) : (
            <button className="modal-back" onClick={close} aria-label="Quay lại">
              <Icon name="back" />
            </button>
          )}
          <h2>{title}</h2>
          <button onClick={close} aria-label="Đóng">
            <Icon name="close" />
          </button>
        </header>
        {children}
      </section>
    </div>
  );
}
