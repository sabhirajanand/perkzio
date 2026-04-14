import RegisterAside from '@/components/register/RegisterAside';

export interface RegisterLayoutProps {
  children: React.ReactNode;
}

export default function RegisterLayout({ children }: RegisterLayoutProps) {
  return (
    <div className="flex min-h-screen w-full min-w-0 flex-col bg-[#F5F5F5] lg:h-screen lg:max-h-screen lg:min-h-0 lg:flex-row lg:overflow-hidden">
      <RegisterAside />
      <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-x-hidden overflow-y-auto bg-[#F9FAFB]">
        <div className="mx-auto w-full max-w-[768px] flex-1 px-4 py-[50px] pb-24 md:px-6 lg:max-w-[1120px] lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}
