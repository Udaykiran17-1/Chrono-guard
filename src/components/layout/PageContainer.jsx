export default function PageContainer({ children, className = '' }) {
  return (
    <main
      className={['mx-auto w-full max-w-[1440px] px-4 py-7 sm:px-6 lg:px-8 lg:py-10', className]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </main>
  );
}
