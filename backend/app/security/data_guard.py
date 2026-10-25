SENSITIVE_KEYS = {
    # Authentication / credentials
    "password",
    "passwd",
    "passcode",
    "pin",
    "secret",
    "secret_key",
    "private_key",
    "access_key",
    "access_token",
    "refresh_token",
    "auth_token",
    "authentication_token",
    "bearer_token",
    "session_token",
    "session_id",
    "token",
    "api_key",
    "apikey",
    "api_secret",
    "client_secret",
    "client_id",
    "credentials",

    # Cloud / infrastructure secrets
    "aws_access_key",
    "aws_secret_key",
    "aws_secret_access_key",
    "azure_key",
    "azure_secret",
    "gcp_key",
    "service_account_key",
    "service_account",
    "private_key_id",
    "pem",
    "ssh_key",
    "ssh_private_key",

    # Database credentials
    "database_password",
    "db_password",
    "database_url",
    "db_url",
    "connection_string",
    "connection_url",

    # Financial information
    "credit_card",
    "credit_card_number",
    "card_number",
    "cardholder_name",
    "cvv",
    "cvc",
    "security_code",
    "bank_account",
    "bank_account_number",
    "account_number",
    "routing_number",
    "iban",
    "swift",
    "upi_id",

    # Government / identity information
    "ssn",
    "social_security_number",
    "aadhaar",
    "aadhaar_number",
    "pan",
    "pan_number",
    "passport",
    "passport_number",
    "driving_license",
    "driving_license_number",
    "national_id",
    "tax_id",

    # Personal information
    "date_of_birth",
    "dob",
    "phone",
    "phone_number",
    "mobile",
    "mobile_number",
    "email",
    "email_address",
    "address",
    "home_address",

    # Encryption / cryptographic material
    "encryption_key",
    "decryption_key",
    "signing_key",
    "encryption_secret",
    "hash",
    "salt",
    "certificate",
    "private_certificate",

    # Webhooks / integrations
    "webhook_secret",
    "webhook_token",
    "github_token",
    "gitlab_token",
    "slack_token",
    "stripe_key",
    "stripe_secret",
}


def detect_sensitive_data(arguments: dict):
    found = []

    for key in arguments:
        if key.lower() in SENSITIVE_KEYS:
            found.append(key)

    return found