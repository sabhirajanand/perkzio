export interface BranchRow {
  id: string;
  name: string;
  status: string;
  isHeadBranch: boolean;
  address: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
  branchAdminEmail: string | null;
}

export interface BranchesListDto {
  ok: true;
  viewerRole: string;
  branches: BranchRow[];
}

export interface BranchRequestRow {
  id: string;
  branchName: string;
  status: string;
  adminEmail: string;
  adminName: string;
  createdAt: string;
  reviewedAt: string | null;
  rejectionReason: string | null;
  resolvedBranchId: string | null;
}

export interface BranchRequestsListDto {
  ok: true;
  requests: BranchRequestRow[];
}
