-- AlterTable
ALTER TABLE "run_results" ALTER COLUMN "enriched_data" DROP NOT NULL,
ALTER COLUMN "total_score" DROP NOT NULL,
ALTER COLUMN "criterion_scores" DROP NOT NULL;

-- AlterTable
ALTER TABLE "runs" ALTER COLUMN "model_id" DROP NOT NULL;
