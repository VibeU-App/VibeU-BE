## Project Structure (`src/` folder)

Here is a breakdown of how our project is organized based on Clean Architecture principles:

### 1. `src/core/`
The "Heart" of the application. This folder contains the business rules and definitions that are completely independent of any external framework or database.
- **`entities/`**: Core business objects/models (Thực thể kinh doanh).
- **`abstracts/`**: The **Contracts** (Hợp đồng). These are abstract classes or interfaces that define what the system should do without saying *how* to do it.
- **`dtos/`**: Data Transfer Objects used to define the shape of data coming in/out of the system.

### 2. `src/use-cases/`
Contains the application-specific business logic (Nghiệp vụ ứng dụng). This layer orchestrates the flow of data to and from the entities, and uses the `abstracts` from Core to perform actions. It doesn't care if the data is saved in MongoDB or SQL.

### 3. `src/frameworks/`
The **Infrastructure** (Hạ tầng) layer. This is where the actual implementation (thực thi) lives.
- It contains the concrete code for databases (MongoDB, TypeORM), external APIs (Mail services, Payment gateways), etc.
- Classes here **inherit** (kế thừa) from the abstracts defined in `src/core/abstracts`.

### 4. `src/services/`
The **Glue Layer** (Lớp kết nối). This folder acts as a bridge (cầu nối).
- It takes the specific implementations from `frameworks` and exports them as generic providers.
- This allows the `use-cases` to stay "clean" by only importing from `services` instead of directly from a specific framework like MongoDB.

### 5. `src/controllers/`
The entry point of the application (Rest API).
- It receives HTTP requests, validates them, and calls the appropriate **Use Case**.
- It is responsible for returning the final response to the client.

### 6. `src/configuration/`
Contains all environment-specific settings (Cấu hình), such as database connection strings, secret keys, and constants.

---

## Project setup

```bash
$ pnpm install
```

## Compile and run the project

```bash
# development
$ pnpm run start

# watch mode
$ pnpm run start:dev

# production mode
$ pnpm run start:prod
```
