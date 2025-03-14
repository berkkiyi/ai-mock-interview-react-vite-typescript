import { Button } from "./ui/button";

interface SaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
}

export const SaveModal = ({
  isOpen,
  onClose,
  onConfirm,
  loading,
}: SaveModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-md shadow-lg">
        <h2 className="text-lg font-bold mb-4">Are you sure?</h2>
        <p>
          This action cannot be undone. You can't edit or re-answer this
          question again!
        </p>

        <div className="mt-6 flex justify-end gap-4">
          <Button disabled={loading} variant={"outline"} onClick={onClose}>
            Cancel
          </Button>
          <Button
            disabled={loading}
            className="bg-emerald-600 hover:bg-emerald-800"
            onClick={onConfirm}
          >
            {loading ? "Saving..." : "Continue"}
          </Button>
        </div>
      </div>
    </div>
  );
};
