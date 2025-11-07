interface Props {
  currentPage: number;
  totalPages: number;
  goToNextPage: () => void;
  goToPreviousPage: () => void;
}

export const PaginationControls = ({
  currentPage,
  totalPages,
  goToNextPage,
  goToPreviousPage,
}: Props) => {
  return (
    <div className="flex justify-center items-center gap-4 mt-6">
      <button
        onClick={goToPreviousPage}
        disabled={currentPage === 1}
        className="px-4 py-2 rounded-full bg-primary cursor-pointer hover:bg-indigo-900 transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Anterior
      </button>
      <span className="text-sm text-indigo-100">
        Página {currentPage} de {totalPages}
      </span>
      <button
        onClick={goToNextPage}
        disabled={currentPage === totalPages}
        className="px-4 py-2 rounded-full bg-primary cursor-pointer hover:bg-indigo-900 transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Siguiente
      </button>
    </div>
  );
};
