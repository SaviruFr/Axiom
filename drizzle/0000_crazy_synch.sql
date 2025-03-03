CREATE TABLE "phishing_domain" (
	"tenant_id" uuid NOT NULL,
	"id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"domain" text NOT NULL,
	"date_added" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"last_seen" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
