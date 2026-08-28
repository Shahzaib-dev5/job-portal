ALTER TABLE companies
    ADD COLUMN secp_number VARCHAR(100) NULL,
    ADD COLUMN sap_number VARCHAR(100) NULL,
    ADD COLUMN ntn_number VARCHAR(100) NULL,
    ADD COLUMN secp_document_path VARCHAR(500) NULL,
    ADD COLUMN sap_document_path VARCHAR(500) NULL,
    ADD COLUMN ntn_document_path VARCHAR(500) NULL;