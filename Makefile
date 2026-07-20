.PHONY: up down seed test status next lab plan verify reset-baseline

up:
	docker compose up -d

down:
	docker compose down

seed:
	uv run dojo seed

test:
	uv run pytest tests/

status:
	uv run dojo status

next:
	uv run dojo next

lab:
	uv run dojo lab $(LESSON)

plan:
	uv run dojo plan $(LESSON) $(EX)

verify:
	uv run dojo verify

reset-baseline:
	uv run dojo reset-baseline
