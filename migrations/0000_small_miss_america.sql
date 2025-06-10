CREATE TABLE "learning_content" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar NOT NULL,
	"description" text,
	"category" varchar NOT NULL,
	"lessons" integer NOT NULL,
	"estimated_minutes" integer NOT NULL,
	"icon" varchar NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "market_data" (
	"id" serial PRIMARY KEY NOT NULL,
	"pair" varchar NOT NULL,
	"timestamp" timestamp NOT NULL,
	"open" numeric(10, 5) NOT NULL,
	"high" numeric(10, 5) NOT NULL,
	"low" numeric(10, 5) NOT NULL,
	"close" numeric(10, 5) NOT NULL,
	"volume" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"sid" varchar PRIMARY KEY NOT NULL,
	"sess" jsonb NOT NULL,
	"expire" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "trading_signals" (
	"id" serial PRIMARY KEY NOT NULL,
	"pair" varchar NOT NULL,
	"action" varchar NOT NULL,
	"entry_price" numeric(10, 5) NOT NULL,
	"take_profit_price" numeric(10, 5) NOT NULL,
	"stop_loss_price" numeric(10, 5) NOT NULL,
	"confidence" integer NOT NULL,
	"status" varchar DEFAULT 'active',
	"result" varchar,
	"created_at" timestamp DEFAULT now(),
	"closed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "user_analytics" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar,
	"date" timestamp NOT NULL,
	"signals_viewed" integer DEFAULT 0,
	"learning_minutes" integer DEFAULT 0,
	"login_count" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY NOT NULL,
	"email" varchar,
	"first_name" varchar,
	"last_name" varchar,
	"profile_image_url" varchar,
	"subscription_tier" varchar DEFAULT 'free',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "user_analytics" ADD CONSTRAINT "user_analytics_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "IDX_session_expire" ON "sessions" USING btree ("expire");