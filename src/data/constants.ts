export const industries = [
  'Financial Services',
  'Healthcare',
  'Technology',
  'Public Sector',
  'Retail',
  'Energy',
  'Education',
  'Manufacturing',
];

export const compliances = ['SOC2', 'HIPAA', 'PCI DSS', 'GDPR', 'FedRAMP', 'NIST CSF', 'ISO 27001'];

export const complianceSuggestions: Record<string, string[]> = {
  SOC2: [
    'microsoft-azure-activity-log',
    'microsoft-office-365-management-activity',
    'microsoft-microsoft-defender-xdr-incidents-alerts',
    'microsoft-microsoft-sentinel-internal-auditing',
  ],
  HIPAA: [
    'microsoft-office-365-management-activity',
    'microsoft-on-prem-windows-security-events',
    'microsoft-microsoft-defender-xdr-incidents-alerts',
    'microsoft-microsoft-purview-dlp-information-protection',
  ],
  'PCI DSS': [
    'fortinet-fortinet-fortigate',
    'various-dns-server-logs',
    'microsoft-on-prem-windows-security-events',
    'microsoft-azure-activity-log',
  ],
  GDPR: [
    'microsoft-azure-activity-log',
    'okta-okta-workforce-identity',
    'microsoft-office-365-management-activity',
    'microsoft-microsoft-sentinel-internal-auditing',
  ],
  FedRAMP: [
    'microsoft-azure-activity-log',
    'microsoft-windows-security-events-from-azure-vms-via-ama-agent',
    'amazon-aws-cloudtrail',
    'google-google-cloud-audit-logs',
  ],
  'NIST CSF': [
    'microsoft-microsoft-defender-for-endpoint-advanced-hunting-tables',
    'microsoft-microsoft-defender-xdr-incidents-alerts',
    'fortinet-fortinet-fortigate',
    'okta-okta-workforce-identity',
  ],
  'ISO 27001': [
    'microsoft-office-365-management-activity',
    'okta-okta-workforce-identity',
    'various-on-prem-linux-syslog',
    'github-github-enterprise-audit-log',
  ],
};

export const tabs = ['Setup', 'Sources', 'Architecture', 'Costs', 'Changelog'] as const;
