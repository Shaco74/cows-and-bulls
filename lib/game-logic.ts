export function calculateBullsAndCows(guess: string, secret: string): { bulls: number; cows: number } {
  if (guess.length !== secret.length) {
    throw new Error('Guess and secret must be the same length');
  }

  let bulls = 0;
  let cows = 0;

  const guessArray = guess.split('');
  const secretArray = secret.split('');
  const secretCounts: { [key: string]: number } = {};
  const guessCounts: { [key: string]: number } = {};

  // Count bulls and build frequency maps
  for (let i = 0; i < guess.length; i++) {
    if (guessArray[i] === secretArray[i]) {
      bulls++;
    } else {
      secretCounts[secretArray[i]] = (secretCounts[secretArray[i]] || 0) + 1;
      guessCounts[guessArray[i]] = (guessCounts[guessArray[i]] || 0) + 1;
    }
  }

  // Count cows
  for (const digit in guessCounts) {
    if (secretCounts[digit]) {
      cows += Math.min(guessCounts[digit], secretCounts[digit]);
    }
  }

  return { bulls, cows };
}

export function isValidNumber(number: string, length: number): boolean {
  // Check if it's exactly the right length
  if (number.length !== length) return false;
  
  // Check if it contains only digits
  if (!/^\d+$/.test(number)) return false;
  
  // Check if all digits are unique
  const digits = new Set(number.split(''));
  return digits.size === number.length;
}

export function generateLobbyCode(): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}