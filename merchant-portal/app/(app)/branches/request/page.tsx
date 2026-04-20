import BranchRequestForm from '@/components/branches/BranchRequestForm';

export default function BranchRequestPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="font-headline text-4xl font-semibold leading-none tracking-tight text-[#333235] md:text-5xl md:leading-none">
          Request Branch Approval
        </h1>
        <p className="max-w-3xl text-lg font-medium leading-7 text-[#4B5563]">
          Submit a new branch and branch admin for platform review.
        </p>
      </div>
      <BranchRequestForm />
    </div>
  );
}

