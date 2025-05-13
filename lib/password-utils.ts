  export function generateSecurePassword(
    length = 16,
    includeUppercase = true,
    includeNumbers = true,
    includeSymbols = true,
  ): string {
    const lowercase = "abcdefghijklmnopqrstuvwxyz"
    const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    const numbers = "0123456789"
    const symbols = "!@#$%^&*()_+~`|}{[]:;?><,./-="

    let chars = lowercase
    if (includeUppercase) chars += uppercase
    if (includeNumbers) chars += numbers
    if (includeSymbols) chars += symbols

    // Ensure we have at least one character from each selected character set
    let password = ""

    if (includeUppercase) {
      password += uppercase.charAt(Math.floor(Math.random() * uppercase.length))
    }

    if (includeNumbers) {
      password += numbers.charAt(Math.floor(Math.random() * numbers.length))
    }

    if (includeSymbols) {
      password += symbols.charAt(Math.floor(Math.random() * symbols.length))
    }

    // Fill the rest of the password
    for (let i = password.length; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * chars.length)
      password += chars.charAt(randomIndex)
    }

    // Shuffle the password characters
    return shuffleString(password)
  }

  function shuffleString(str: string): string {
    const array = str.split("")
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[array[i], array[j]] = [array[j], array[i]]
    }
    return array.join("")
  }
