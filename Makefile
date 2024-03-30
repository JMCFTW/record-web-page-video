up:
	@docker-compose up -d --build
log:
	@docker logs -f record-page
down:
	@docker-compose down -v
	@docker ps -a | awk 'NR > 1 {print $$1}' | xargs docker rm
copy:
	@docker cp record-page:/usr/app/test1.mp4 .
	@open test1.mp4
exec:
	@docker exec -it record-page bash
