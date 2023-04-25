setup:
	npm i -g pnpm
	pnpm i
	pnpx prisma db push
	pnpx prisma db seed
	pnpm dev
