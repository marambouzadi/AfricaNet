# Étape 1 : Build avec Maven
FROM eclipse-temurin:21-jdk AS build
WORKDIR /app
COPY .mvn/ .mvn
COPY mvnw pom.xml ./
RUN chmod +x mvnw && ./mvnw dependency:go-offline -B
COPY src ./src
RUN ./mvnw clean package -DskipTests -B

# Étape 2 : Image finale runtime
FROM eclipse-temurin:21-jre
WORKDIR /app

RUN addgroup --system javauser && adduser --system --ingroup javauser javauser
USER javauser

COPY --from=build /app/target/*.jar app.jar
EXPOSE 8090

ENTRYPOINT ["java", "-Xmx512m", "-jar", "app.jar"]
