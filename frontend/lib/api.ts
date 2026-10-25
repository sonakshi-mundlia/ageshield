const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8001";

// ============================================================
// TYPES
// ============================================================

export type RiskLevel =
  | "low"
  | "medium"
  | "high"
  | "critical";

export type SecurityDecision =
  | "ALLOW"
  | "BLOCK"
  | "APPROVAL_REQUIRED";

export type ApprovalDecision = "approved" | "rejected";

export interface User {
  id: number;
  company_id: number;
  name: string;
  email: string;
  role: string;
  company_name?: string;
}

export interface Agent {
  id: number;
  company_id: number;
  name: string;
  description: string;
  active: boolean;
}

export interface Tool {
  id: number;
  company_id: number;
  name: string;
  description: string;
  risk_level: RiskLevel;
}

export interface Policy {
  id: number;
  company_id: number;
  name: string;
  tool_name: string;
  action: string;
  min_amount: number | null;
  max_amount: number | null;
  enabled: boolean;
  conditions: Record<string, unknown>;
}

export interface Approval {
  id: number;
  company_id: number;
  tool_call_id: number;
  status: string;
  details: Record<string, unknown>;
  created_at: string;
  decided_at: string | null;
}

export interface SecurityEvent {
  id: number;
  company_id: number;
  event_type: string;
  severity: string;
  message: string;
  metadata_json: Record<string, unknown>;
  created_at: string;
}

export interface AgentRegistrationResponse extends Agent {
  api_key: string;
}

// ============================================================
// AUTH TYPES
// ============================================================

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user_id: number;
  company_id: number;
  name: string;
  email: string;
  role: string;
}

export interface RegisterResponse {
  access_token: string;
  token_type?: string;
  user_id: number;
  company_id: number;
  name: string;
  email: string;
  role: string;
}

// ============================================================
// CONFIGURATION TYPES
// ============================================================

export interface ConfigurationSummary {
  policies: number;
  approval_rules: number;
  data_patterns: number;
  guidelines: number;
  agents: number;
}

export interface ConfigurationResponse {
  success: boolean;
  message: string;
  configuration_id: number;
  company_id: number;
  version: string;
  summary: ConfigurationSummary;
}

export interface CompanyConfiguration {
  id: number;
  company_id: number;
  version: string;
  configuration: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface EffectiveConfigurationResponse {
  company_id: number;
  configuration: Record<string, unknown>;
}

// ============================================================
// SECURITY TYPES
// ============================================================

export interface ToolAuthorizationRequest {
  agent_id: number;
  tool_name: string;
  arguments: Record<string, unknown>;
}

export interface ToolAuthorizationResponse {
  decision: SecurityDecision;
  reason: string;
}

// ============================================================
// GENERIC API REQUEST
// ============================================================

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {

  const headers = new Headers(options.headers);

  if (options.body && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: "include",
  });

  if (!response.ok) {
    let message = "Request failed.";

    try {
      const error = await response.json();

      if (typeof error.detail === "string") {
        message = error.detail;
      } else if (typeof error.message === "string") {
        message = error.message;
      }
    } catch {
    }

    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

// ============================================================
// AUTH
// ============================================================

export async function login(
  email: string,
  password: string
): Promise<LoginResponse> {
  const data = await request<LoginResponse>(
    "/api/auth/login",
    {
      method: "POST",
      body: JSON.stringify({
        email,
        password,
      }),
    }
  );

  return data;
}

export async function register(
  company_name: string,
  name: string,
  email: string,
  password: string
): Promise<RegisterResponse> {
  const data = await request<RegisterResponse>(
    "/api/auth/register",
    {
      method: "POST",
      body: JSON.stringify({
        company_name,
        name,
        email,
        password,
      }),
    }
  );

  return data;
}

export async function getCurrentUser(): Promise<User> {
  return request<User>("/api/auth/me");
}

export async function logout(): Promise<void> {
  await request("/api/auth/logout", {
    method: "POST",
  });
}


 // ============================================================
 // AGENTS
 // ============================================================

export async function getAgents(): Promise<Agent[]> {
  return request<Agent[]>("/api/agents");
}

export async function createAgent(
  name: string,
  description: string
): Promise<AgentRegistrationResponse> {
  return request<AgentRegistrationResponse>("/api/agents", {
    method: "POST",
    body: JSON.stringify({ name, description }),
  });
}

export async function deactivateAgent(
  agentId: number
): Promise<AgentRegistrationResponse> {
  return request<AgentRegistrationResponse>(`/api/agents/${agentId}`, {
    method: "DELETE",
  });
}

export async function deleteAgent(
  agentId: number
): Promise<AgentRegistrationResponse> {
  return request<AgentRegistrationResponse>(
    `/api/agents/${agentId}/permanent`,
    {
      method: "DELETE",
    }
  );
}
export async function getAgentApiKey(
  agentId: number
): Promise<AgentRegistrationResponse> {
  return request<AgentRegistrationResponse>(
    `/api/agents/${agentId}/api-key`
  );
}


// ============================================================
// TOOLS
// ============================================================

export async function getTools(): Promise<Tool[]> {
  return request<Tool[]>("/api/tools");
}

export async function createTool(
  name: string,
  description: string,
  risk_level: RiskLevel
): Promise<Tool> {
  return request<Tool>("/api/tools", {
    method: "POST",
    body: JSON.stringify({
      name,
      description,
      risk_level,
    }),
  });
}

// ============================================================
// POLICIES
// ============================================================

export async function getPolicies(): Promise<Policy[]> {
  return request<Policy[]>("/api/policies");
}

export async function createPolicy(
  data: Omit<Policy, "id" | "company_id">
): Promise<Policy> {
  return request<Policy>("/api/policies", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function deletePolicy(
  policyId: number
): Promise<void> {
  return request<void>(
    `/api/policies/${policyId}`,
    {
      method: "DELETE",
    }
  );
}

// ============================================================
// APPROVALS
// ============================================================

export async function getPendingApprovals(): Promise<Approval[]> {
  return request<Approval[]>(
    "/api/approvals/pending"
  );
}

export async function decideApproval(
  approvalId: number,
  decision: ApprovalDecision
): Promise<Approval> {
  return request<Approval>(
    `/api/approvals/${approvalId}/decision`,
    {
      method: "POST",
      body: JSON.stringify({
        decision,
      }),
    }
  );
}

// ============================================================
// AUDIT
// ============================================================

export async function getAuditEvents(
  limit = 100
): Promise<SecurityEvent[]> {
  return request<SecurityEvent[]>(
    `/api/audit?limit=${limit}`
  );
}

// ============================================================
// SECURITY AUTHORIZATION
// ============================================================

export async function authorizeToolCall(
  data: ToolAuthorizationRequest
): Promise<ToolAuthorizationResponse> {
  return request<ToolAuthorizationResponse>(
    "/api/security/authorize",
    {
      method: "POST",
      body: JSON.stringify(data),
    }
  );
}

// ============================================================
// CONFIGURATION
// ============================================================

export async function uploadConfiguration(
  file: File
): Promise<ConfigurationResponse> {
  const formData = new FormData();

  formData.append("file", file);

  return request<ConfigurationResponse>(
    "/api/company/configuration",
    {
      method: "POST",
      body: formData,
    }
  );
}


export async function getConfiguration(): Promise<CompanyConfiguration> {
  return request<CompanyConfiguration>(
    "/api/company/configuration"
  );
}

export async function getEffectiveConfiguration(): Promise<EffectiveConfigurationResponse> {
  return request<EffectiveConfigurationResponse>(
    "/api/company/configuration/effective"
  );
}
