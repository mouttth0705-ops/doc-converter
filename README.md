# 📝 Text Format Converter

A powerful text format conversion tool that supports automatic line breaking for compressed text and automatic compression for multi-line text. Especially suitable for account information and batch data processing scenarios.

## ✨ Key Features

- 🔄 **Bidirectional Conversion**: Switch freely between compressed format ↔ line-by-line format
- 🎯 **Multiple Separators**: Supports `|`, `---`, and `:` separators
- 🧠 **Smart Header Recognition**: Automatically detects header fields and adds titles to each line of data
- 📦 **Batch Processing**: Process multiple records at once
- 📁 **File Upload**: Supports TXT file upload and drag-and-drop
- 📊 **Real-time Statistics**: Displays line count and character count
- 📋 **One-click Copy**: Quickly copy conversion results
- ⌨️ **Keyboard Shortcuts**: Improve operation efficiency

## 🚀 Quick Start

### Online Usage

Simply open the `index.html` file in your browser. No installation required.

### Local Setup

```bash
# Clone the repository
git clone https://github.com/mouttth0705-ops/doc-converter.git

# Navigate to project folder
cd doc-converter

# Open index.html in your browser
```

## 📖 Usage Guide

### 1️⃣ Convert to Line Format

Convert compressed text separated by delimiters into individual lines.

**Input Example:**
```
user1 | pass1 | email1@test.com
user2 | pass2 | email2@test.com
```

**Set Headers (Optional):**
```
Username | Password | Email
```

**Output Result:**
```
Username: user1
Password: pass1
Email: email1@test.com

Username: user2
Password: pass2
Email: email2@test.com
```

### 2️⃣ Compress to Single Line

Compress multi-line text into a single line using the selected separator.

**Input Example:**
```
Username
Password
Email
```

**Output Result:**
```
Username | Password | Email
```

### 3️⃣ Batch Processing

Support inputting multiple records at once, one record per line, automatically batch convert.

**Input Example:**
```
Username | Password | Email
user1 | pass1 | email1@test.com
user2 | pass2 | email2@test.com
user3 | pass3 | email3@test.com
```

The program will automatically recognize the first line as headers and the rest as data, then batch convert and output.

### 4️⃣ File Upload

**Method 1: Click Upload**
1. Click the "📁 Upload TXT" button
2. Select a .txt file
3. File content will be automatically loaded into the input box

**Method 2: Drag and Drop**
1. Drag a .txt file from file explorer
2. Drop it onto the input text box
3. Release to automatically upload

## 🎯 Supported Formats

### Input Formats

1. **Pipe Separator**: `xxxx | xxxx | xxx`
2. **Triple Dash Separator**: `xxxx---xxxx---xxxx`
3. **Colon Separator**: `xxxx:xxxx:xxxx`
4. **Multi-line Text**: One field per line

### Output Formats

1. **Line Format**: Each field on a separate line
2. **Compressed Format**: Connected with separators into a single line

## ⌨️ Keyboard Shortcuts

- `Ctrl/Cmd + Enter`: Convert to line format
- `Ctrl/Cmd + Shift + Enter`: Compress to single line

## 🌟 Special Features

### Smart Header Recognition

The program automatically detects header lines (containing multiple fields separated by delimiters), for example:

```
Username | Password | 2FA | Email | OAuth Token
```

When headers are detected, you can choose to add corresponding titles to each line of data:

```
Username: value1
Password: value2
2FA: value3
Email: value4
OAuth Token: value5
```

### Additional Notes Recognition

The program intelligently recognizes and separates account description information, classifying it into the "Other Notes" area for separate display.

### Batch Data Processing

Supports importing multiple records at once (separated by line breaks), batch conversion and output, with blank lines separating different records.

## 📁 File Structure

```
text-format-converter/
├── index.html      # Main HTML file
├── script.js       # JavaScript core logic
├── style.css       # CSS stylesheet
└── README.md       # Documentation
```

## 🔧 Tech Stack

- **HTML5**: Page structure
- **CSS3**: Styles and animation effects
- **Vanilla JavaScript**: Core conversion logic

## 💡 Use Cases

- Account list format conversion
- Data import/export format adjustment
- Bulk text processing
- Configuration file format conversion
- CSV/TSV data formatting

## 📝 Notes

- Program automatically filters empty lines
- Automatically trims whitespace from the beginning and end of each line during conversion
- Supports text processing of any length
- File upload limit: TXT format, maximum 5MB
- Supports UTF-8 encoding

## 🎨 Interface Features

- Modern gradient color design
- Left-right split layout with spacious output area
- Clear visual feedback
- Responsive design, supports both mobile and desktop
- Smooth animation effects

## 🤝 Contributing

Suggestions and improvements are welcome!

## 📄 License

MIT License

---

**Enjoy using Text Format Converter!** 🎉
