# Seed Data for Word Suggestions

This folder contains text files with words used to populate the autocomplete suggestions in the dictionary application.

## Files

- **en.txt** - English words for autocomplete
- **vi.txt** - Vietnamese words for autocomplete

## Format

Each file should contain:
- One word per line
- Empty lines are ignored
- Lines starting with `#` are treated as comments and ignored
- Words can contain spaces (for multi-word phrases)

### Example:

```
# Common greetings
hello
goodbye
thank you

# Technology terms
computer
software
database
```

## Usage

### Running the Seed Script

```bash
# Seed the database with words from these files
pnpm db:seed
```

The script will:
1. Read all words from `en.txt` and `vi.txt`
2. Insert them into the database in batches (100 words at a time)
3. Skip duplicate words (same word + language combination)
4. Show progress as it processes the words

### Adding New Words

1. Open `en.txt` or `vi.txt` in a text editor
2. Add new words, one per line
3. Save the file
4. Run `pnpm db:seed` to update the database

### Re-seeding

The seed script uses `ON CONFLICT DO NOTHING`, which means:
- Running it multiple times is safe
- Existing words won't be duplicated
- Only new words will be added

To completely reset the words:
```bash
# Connect to your database and run:
DELETE FROM words;

# Then re-seed:
pnpm db:seed
```

## Word Categories

### English (en.txt)

Current categories included:
- Common verbs (be, have, do, say, etc.)
- Common nouns (time, person, year, etc.)
- Common adjectives (good, new, first, etc.)
- Technology terms (computer, internet, software, etc.)
- Education terms (school, student, teacher, etc.)
- Daily life words
- And more...

### Vietnamese (vi.txt)

Current categories included:
- Động từ phổ biến (Common verbs)
- Danh từ phổ biến (Common nouns)
- Tính từ phổ biến (Common adjectives)
- Từ công nghệ (Technology words)
- Từ giáo dục (Education words)
- Từ thông dụng khác (Other common words)
- And more...

## Tips for Adding Words

### Best Practices

1. **Add commonly used words first**
   - Focus on words people are likely to search for
   - Include both formal and informal language

2. **Include variations**
   - Different tenses (run, running, ran)
   - Plural forms (cat, cats)
   - Common misspellings (if you want to help users)

3. **Organize with comments**
   - Use `#` to add category headers
   - Makes the file easier to maintain

4. **Consider your audience**
   - Add domain-specific terms if needed
   - Include slang or colloquialisms if appropriate

### Example Additions

```
# Business terms
meeting
presentation
deadline
budget
revenue

# Food and cooking
recipe
ingredient
delicious
restaurant
menu
```

## Performance Notes

- The seed script processes words in batches of 100
- Large files (10,000+ words) will take a few seconds
- Progress is shown in the terminal
- Database indexes ensure fast autocomplete lookups

## Current Statistics

Run `pnpm db:seed` to see how many words are in each file.

The script will display:
```
📖 Reading word files...
  Found XXX English words
  Found XXX Vietnamese words
```

## Troubleshooting

### "No words found in seed files"

- Make sure `en.txt` and `vi.txt` exist in the `seed/` folder
- Check that files contain at least one non-comment, non-empty line

### "Error inserting batch"

- Check for special characters that might need escaping
- Ensure words don't exceed 255 characters (database limit)
- Check database connection

### Duplicate words not being skipped

- Make sure the unique constraint exists on the `words` table
- The seed script will attempt to create it automatically
- You can manually add it: `ALTER TABLE words ADD CONSTRAINT words_word_language_unique UNIQUE (word, language);`

## Contributing Words

When adding words to these files:

1. Keep them relevant and useful
2. Avoid offensive or inappropriate content
3. Verify spelling and accuracy
4. Consider adding translations in pairs (if you add an English word, consider adding its Vietnamese equivalent)

## File Encoding

- Files should be saved in **UTF-8** encoding
- This is important for Vietnamese characters (ă, â, đ, ê, ô, ơ, ư, etc.)
- Most modern text editors use UTF-8 by default

