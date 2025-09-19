package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

// AppConfig holds application configuration loaded from environment variables.
type AppConfig struct {
	AppPort       string
	MySQLDSN      string
	Env           string
	BailianAPIURL string
	BailianAPIKey string
	LogDir        string
}

var C AppConfig

// Load reads environment variables, optionally from a .env file.
func Load() {
	_ = godotenv.Load()

	C = AppConfig{
		AppPort:       getEnv("APP_PORT", "8080"),
		MySQLDSN:      getEnv("MYSQL_DSN", "root:@tcp(127.0.0.1:3306)/ai_career_buddy?charset=utf8mb4&parseTime=True&loc=Local"),
		Env:           getEnv("APP_ENV", "dev"),
		BailianAPIURL: getEnv("BAILIAN_API_URL", "http://higress-pirate-prod-gao.weizhipin.com/v1/chat/completions"),
		BailianAPIKey: getEnv("BAILIAN_API_KEY", "sk-84229c5e-18ea-4b6a-a04a-2183688f9373"),
		LogDir:        getEnv("LOG_DIR", "./logs"),
	}

	if C.MySQLDSN == "" {
		log.Fatal("MYSQL_DSN 未配置")
	}
}

func getEnv(key string, def string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return def
}
