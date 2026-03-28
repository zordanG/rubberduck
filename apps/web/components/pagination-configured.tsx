import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

type PaginationConfiguredProps = {
  currentPage: number;
  totalPages: number;
};

export default function PaginationConfigured({ currentPage, totalPages }: PaginationConfiguredProps) {
  const maxPagesToShowAll = 5;
  // IMPORTANTE: Este valor deve ser no máximo Math.floor(totalPages / 2)
  // nos cenários onde a paginação é truncada (totalPages > maxPagesToShowAll),
  // para evitar que os blocos de botões se sobreponham.
  const boundaryCount = 3;
  const shouldShowAllPages = totalPages <= maxPagesToShowAll;

  const getPaginationLayout = () => {
    if (shouldShowAllPages) return 'ALL';
    if (currentPage <= boundaryCount) return 'START';
    if (currentPage >= totalPages - (boundaryCount - 1)) return 'END';
    return 'MIDDLE';
  };

  const layout = getPaginationLayout();

  return (
    <Pagination className='mt-8'>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            aria-disabled={currentPage <= 1}
            tabIndex={currentPage <= 1 ? -1 : undefined}
            className={currentPage <= 1 ? 'pointer-events-none opacity-50' : undefined}
            href={`?page=${currentPage - 1}`}
          />
        </PaginationItem>

        {layout === 'ALL' &&
          Array.from({ length: totalPages }, (_, index) => (
            <PaginationItem key={`pagination-${index}`}>
              <PaginationLink href={`?page=${index + 1}`} isActive={index + 1 === currentPage}>
                {index + 1}
              </PaginationLink>
            </PaginationItem>
          ))}

        {layout === 'START' && (
          <>
            {Array.from({ length: boundaryCount }, (_, index) => (
              <PaginationItem key={`pagination-${index}`}>
                <PaginationLink href={`?page=${index + 1}`} isActive={index + 1 === currentPage}>
                  {index + 1}
                </PaginationLink>
              </PaginationItem>
            ))}

            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>

            <PaginationItem>
              <PaginationLink href={`?page=${totalPages}`}>{totalPages}</PaginationLink>
            </PaginationItem>
          </>
        )}

        {layout === 'END' && (
          <>
            <PaginationItem>
              <PaginationLink href='?page=1'>1</PaginationLink>
            </PaginationItem>

            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>

            {Array.from({ length: boundaryCount }, (_, index) => {
              const invertedIndex = boundaryCount - (index + 1);
              return (
                <PaginationItem key={`pagination-${index}`}>
                  <PaginationLink
                    href={`?page=${totalPages - invertedIndex}`}
                    isActive={totalPages - invertedIndex === currentPage}
                  >
                    {totalPages - invertedIndex}
                  </PaginationLink>
                </PaginationItem>
              );
            })}
          </>
        )}

        {layout === 'MIDDLE' && (
          <>
            <PaginationItem>
              <PaginationLink href='?page=1'>1</PaginationLink>
            </PaginationItem>

            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>

            <PaginationItem>
              <PaginationLink href={`?page=${currentPage}`} isActive>
                {currentPage}
              </PaginationLink>
            </PaginationItem>

            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>

            <PaginationItem>
              <PaginationLink href={`?page=${totalPages}`}>{totalPages}</PaginationLink>
            </PaginationItem>
          </>
        )}

        <PaginationItem>
          <PaginationNext
            aria-disabled={currentPage >= totalPages}
            tabIndex={currentPage >= totalPages ? -1 : undefined}
            className={currentPage >= totalPages ? 'pointer-events-none opacity-50' : undefined}
            href={`?page=${currentPage + 1}`}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
