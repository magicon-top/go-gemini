package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"os/exec"
	"strings"
	"syscall"
	"unsafe"
)

var (
	user32           = syscall.NewLazyDLL("user32.dll")
	enumWindows      = user32.NewProc("EnumWindows")
	setForegroundWin = user32.NewProc("SetForegroundWindow")
	getWindowTextW   = user32.NewProc("GetWindowTextW")
	seenPayloads     = make(map[string]bool)
)

type TopicPayload struct {
	Title    string `json:"title"`    //Topic title string
	URL      string `json:"url"`      //Full conversation URL
	Question string `json:"question"` //Extracted user query
	Answer   string `json:"answer"`   //Extracted model response
}

type ResponsePayload struct {
	Status    string `json:"status"`    //Status string
	Processed string `json:"processed"` //Processed question text
}

//________________
//Searches for Edge window and switches focus to it without changing its state. Function
func activateEdgeWindow() bool {
	var targetHWND uintptr
	cb := syscall.NewCallback(func(hwnd uintptr, lparam uintptr) uintptr {
		buf := make([]uint16, 512)
		getWindowTextW.Call(hwnd, uintptr(unsafe.Pointer(&buf[0])), uintptr(len(buf)))
		name := syscall.UTF16ToString(buf)
		if containsEdge(name) {
			targetHWND = hwnd
			return 0
		}
		return 1
	})
	enumWindows.Call(cb, 0)
	if targetHWND != 0 {
		setForegroundWin.Call(targetHWND)
		return true
	}
	return false
}

//________________
//Checks whether window title contains Edge identifier. Function
func containsEdge(title string) bool {
	if len(title) == 0 {
		return false
	}
	return stringContains(title, "Edge") || stringContains(title, "Gemini") //Matches browser title
}

//________________
//Checks substring presence in target string. Function
func stringContains(s, substr string) bool {
	if len(s) < len(substr) {
		return false
	}
	for i := 0; i <= len(s)-len(substr); i++ {
		if s[i:i+len(substr)] == substr {
			return true
		}
	}
	return false //Sub-string search
}

//________________
//Launches Edge browser with target Gemini URL. Function
func launchEdge() {
	exec.Command("cmd", "/c", "start", "msedge", "https://gemini.google.com/").Start() //Executes shell command
}

//________________
//Handles incoming HTTP JSON requests and processes payload. Function
func handleTopic(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
	w.Header().Set("Content-Type", "application/json")
	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}
	if r.Method != "POST" {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	var p TopicPayload
	if err := json.NewDecoder(r.Body).Decode(&p); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	payloadKey := p.Title + "|" + p.URL + "|" + p.Question + "|" + p.Answer
	if seenPayloads[payloadKey] {
		json.NewEncoder(w).Encode(ResponsePayload{Status: "skipped", Processed: ""})
		return
	}
	seenPayloads[payloadKey] = true
	theme := p.Title
	question := p.Question
	answer := p.Answer
	fmt.Println("\n==============================")
	fmt.Printf("Тема: %s\nURL: %s\n\nВопрос: %s\n\nОтвет: %s\n", theme, p.URL, question, answer)
	fmt.Println("==============================")
	folder := ""
	trimmedQ := strings.TrimSpace(question)
	firstSpace := strings.Index(trimmedQ, " ")
	firstWord := trimmedQ
	if firstSpace != -1 {
		firstWord = trimmedQ[:firstSpace]
	}
	if strings.Contains(firstWord, "-") && isAlphaNumericHyphen(firstWord) {
		folder = firstWord
		replacedFirstWord := strings.Replace(firstWord, "-", "_", 1)
		question = strings.Replace(question, firstWord, replacedFirstWord, 1)
	}
	question = question + "\n"
	if folder != "" {
		filePath := "D:/P/" + folder + "/src/main.go"
		if fileBytes, err := os.ReadFile(filePath); err == nil {
			question = question + string(fileBytes)
		}
	}
	resp := ResponsePayload{
		Status:    "ok",
		Processed: question,
	}
	json.NewEncoder(w).Encode(resp)
}

//________________
//Checks if string contains only alphanumeric characters and hyphens. Function
func isAlphaNumericHyphen(s string) bool {
	for i := 0; i < len(s); i++ {
		c := s[i]
		if !((c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || (c >= '0' && c <= '9') || c == '-') {
			return false
		}
	}
	return true
}

//________________
//Main application entry point. Function
func main() {
	fmt.Println("Поиск окна Edge...")
	if !activateEdgeWindow() {
		fmt.Println("Окно Edge не найдено. Запуск браузера...")
		launchEdge()
	} else {
		fmt.Println("Окно Edge найдено и активировано.")
	}
	http.HandleFunc("/api/topic", handleTopic)
	fmt.Println("Локальный Go-сервер запущен на :8080. Ожидание данных...")
	if err := http.ListenAndServe(":8080", nil); err != nil {
		fmt.Printf("Ошибка запуска сервера: %v\n", err)
	}
}