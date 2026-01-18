import json
import glob
import os
import re
from collections import defaultdict, Counter
from datetime import datetime, timezone, timedelta

def fix_text(text):
    if not isinstance(text, str):
        return text
    try:
        # Facebook JSON often encodes UTF-8 bytes as Latin-1 characters.
        # We encode to latin1 to get the raw bytes, then decode as utf-8.
        return text.encode('latin1').decode('utf-8')
    except (UnicodeEncodeError, UnicodeDecodeError):
        try:
            # Sometimes it's interpreted as CP1252 (Windows-1252).
            return text.encode('cp1252').decode('utf-8')
        except:
            return text
    return text

def is_url(text):
    if not isinstance(text, str):
        return False
    text_lower = text.lower()
    return text_lower.startswith('http') or text_lower.startswith('www') or '://' in text_lower

def process_uploaded_data(files_data):
    # Data structures for stats
    user_word_counts = defaultdict(Counter)
    total_word_counts = Counter()
    messages_with_likes = []
    emoji_counts = Counter()
    user_emoji_counts = Counter()
    user_image_counts = Counter()

    # Special Rankings Data
    all_messages = [] # Flattened list of all messages for time/reply analysis
    user_likes_received = Counter()
    user_messages_sent = Counter()
    user_reels_sent = Counter()
    user_longest_words = defaultdict(lambda: {"word": "", "length": 0})
    user_likes_given = Counter() # Most Messages Liked
    likes_matrix = defaultdict(lambda: defaultdict(int)) # actor -> sender likes
    
    # Regex for detecting emojis (broad range)
    emoji_pattern = re.compile(r'[\U00010000-\U0010ffff]', flags=re.UNICODE)
    
    # Profanity patterns for variations like fuckkkk, fucking, etc.
    profanity_patterns = [
        re.compile(r'\b[fF]+[uU]+[cC]+[kK]+[a-zA-Z]*\b'),
        re.compile(r'\b[sS]+[hH]+[iI]+[tT]+[a-zA-Z]*\b'),
        re.compile(r'\b[bB]+[iI]+[tT]+[cC]+[hH]+[a-zA-Z]*\b'),
        re.compile(r'\b[dD]+[aA]+[mM]+[nN]+[a-zA-Z]*\b'),
        re.compile(r'\b[aA]+[sS]+[sS]+[a-zA-Z]*\b'),
        re.compile(r'\b[hH]+[eE]+[lL]+[lL]+[a-zA-Z]*\b')
    ]
    user_profanity_counts = Counter()

    # Comprehensive Stopwords List
    STOPWORDS = {
        'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', "you're", "you've", "you'll", "you'd",
        'your', 'yours', 'yourself', 'yourselves', 'he', 'him', 'his', 'himself', 'she', "she's", 'her', 'hers',
        'herself', 'it', "it's", 'its', 'itself', 'they', 'them', 'their', 'theirs', 'themselves', 'what', 'which',
        'who', 'whom', 'this', 'that', "that'll", 'these', 'those', 'am', 'is', 'are', 'was', 'were', 'be', 'been',
        'being', 'have', 'has', 'had', 'having', 'do', 'does', 'did', 'doing', 'a', 'an', 'the', 'and', 'but', 'if',
        'or', 'because', 'as', 'until', 'while', 'of', 'at', 'by', 'for', 'with', 'about', 'against', 'between',
        'into', 'through', 'during', 'before', 'after', 'above', 'below', 'to', 'from', 'up', 'down', 'in', 'out',
        'on', 'off', 'over', 'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why',
        'how', 'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not',
        'only', 'own', 'same', 'so', 'than', 'too', 'very', 's', 't', 'can', 'will', 'just', 'don', "don't", 'should',
        "should've", 'now', 'd', 'll', 'm', 'o', 're', 've', 'y', 'ain', 'aren', "aren't", 'couldn', "couldn't",
        'didn', "didn't", 'doesn', "doesn't", 'hadn', "hadn't", 'hasn', "hasn't", 'haven', "haven't", 'isn', "isn't",
        'ma', 'mightn', "mightn't", 'mustn', "mustn't", 'needn', "needn't", 'shan', "shan't", 'shouldn', "shouldn't",
        'wasn', "wasn't", 'weren', "weren't", 'won', "won't", 'wouldn', "wouldn't", 'like', 'get', 'got', 'know',
        'think', 'going', 'really', 'yeah', 'lol', 'lmao', 'good', 'well', 'much', 'see', 'want', 'one', 'even',
        'message', 'liked', 'im', 'guys', 'sent', 'attachment', 'dont', 'ur'
    }

    for file_info in files_data:
        try:
            data = json.loads(file_info['content'])
            
            if 'messages' not in data:
                continue

            for message in data['messages']:
                if 'sender_name' not in message:
                    continue
                    
                sender = fix_text(message['sender_name'])
                user_messages_sent[sender] += 1
                
                # Store for chronological processing
                if 'timestamp_ms' in message:
                    # Fix sender name in stored message too for consistency later
                    message['sender_name'] = sender
                    all_messages.append(message)

                # 1. Word Counts & Longest Word & Profanity
                if 'content' in message:
                    content = fix_text(message['content'])
                    
                    # Split into words first
                    raw_words = content.split()
                    
                    # Filter out URLs
                    non_url_words = [w for w in raw_words if not is_url(w)]
                    
                    # Process for Word Counts
                    processed_words = []
                    for w in non_url_words:
                        # Check for profanity
                        for pattern in profanity_patterns:
                            if pattern.match(w):
                                user_profanity_counts[sender] += 1
                                break # Count each word only once

                        # Basic tokenization: lowercase and remove non-alphanumeric characters
                        cleaned = re.sub(r'[^\w\s]', '', w.lower())
                        if cleaned and cleaned not in STOPWORDS and len(cleaned) > 1:
                            processed_words.append(cleaned)
                    
                    user_word_counts[sender].update(processed_words)
                    total_word_counts.update(processed_words)
                    
                    # Track longest word (Exclude links and non-alpha)
                    for word in non_url_words:
                        # Clean word for length check (remove punctuation from ends)
                        clean_word = re.sub(r'^[^\w]+|[^\w]+$', '', word)
                        
                        # Strict check: Must be purely English letters to avoid emojis/symbols/mojibake
                        if not re.match(r'^[a-zA-Z]+$', clean_word):
                            continue
                        
                        if len(clean_word) > user_longest_words[sender]["length"]:
                            user_longest_words[sender] = {"word": clean_word, "length": len(clean_word)}

                    # 4. & 5. Emoji Stats
                    emojis = emoji_pattern.findall(content)
                    if emojis:
                        emoji_counts.update(emojis)
                        user_emoji_counts[sender] += len(emojis)
                    
                    # Check for Reels
                    if "instagram.com/reel" in content:
                        user_reels_sent[sender] += 1
                    elif 'share' in message and 'link' in message['share'] and "instagram.com/reel" in message['share']['link']:
                         user_reels_sent[sender] += 1


                # 3. Most Liked Messages & Aura (Likes Received) & Likes Given & Matrix
                if 'reactions' in message:
                    like_count = len(message['reactions'])
                    if like_count > 0:
                        user_likes_received[sender] += like_count
                        
                        # Track who GAVE the likes
                        for reaction in message['reactions']:
                            if 'actor' in reaction:
                                actor = fix_text(reaction['actor'])
                                user_likes_given[actor] += 1
                                likes_matrix[actor][sender] += 1
                        
                        # Fix content encoding and filter out non-ASCII messages
                        raw_content = message.get('content', '[Media/No Content]')
                        fixed_content = fix_text(raw_content) if raw_content != '[Media/No Content]' else raw_content
                        
                        # Only include messages with proper ASCII content
                        try:
                            fixed_content.encode('ascii', 'strict')
                            msg_info = {
                                "content": fixed_content,
                                "sender": sender,
                                "likes": like_count,
                                "timestamp": message.get('timestamp_ms', 0)
                            }
                            messages_with_likes.append(msg_info)
                        except UnicodeEncodeError:
                            # Skip messages that can't be converted to ASCII
                            pass

                # 6. Image Stats
                if 'photos' in message or 'videos' in message or 'sticker' in message or 'gifs' in message:
                     user_image_counts[sender] += 1

        except Exception as e:
            print(f"Error processing file: {e}")

    # --- Compile Stats ---

    # Sort all messages by timestamp for time-based analysis
    all_messages.sort(key=lambda x: x.get('timestamp_ms', 0))

    # Time-based Analysis & Replies
    night_owl_counts = Counter()
    morning_person_counts = Counter()
    replied_to_counts = Counter()

    # Timezone: UTC-8 (PST)
    pst_tz = timezone(timedelta(hours=-8))

    for i, msg in enumerate(all_messages):
        sender = msg.get('sender_name')
        ts_ms = msg.get('timestamp_ms', 0)
        
        # Convert to datetime in PST
        dt = datetime.fromtimestamp(ts_ms / 1000.0, tz=pst_tz)
        hour = dt.hour

        # Night Owl: 12 AM - 5 AM (0 - 5)
        if 0 <= hour < 5:
            night_owl_counts[sender] += 1
        
        # Morning Person: 6 AM - 11 AM (6 - 11)
        elif 6 <= hour < 12:
            morning_person_counts[sender] += 1
        
        # Most Replied To Heuristic
        if i < len(all_messages) - 1:
            next_msg = all_messages[i+1]
            next_ts = next_msg.get('timestamp_ms', 0)
            next_sender = next_msg.get('sender_name')
            
            if next_sender != sender:
                time_diff = (next_ts - ts_ms) / 1000.0 # seconds
                if time_diff < 300: # 5 minutes
                    replied_to_counts[sender] += 1

    # --- Generate Rankings ---

    def get_top_10(counter_obj):
        return counter_obj.most_common(10)

    # 1. Top 10 words per user
    top_words_per_user = {}
    for user, counter in user_word_counts.items():
        top_words_per_user[user] = counter.most_common(10)

    # 2. Top 10 words overall
    top_words_overall = total_word_counts.most_common(10)

    # 3. Top 10 liked messages
    top_liked_messages = sorted(messages_with_likes, key=lambda x: x['likes'], reverse=True)[:10]

    # 4. Top 10 emojis
    top_emojis = emoji_counts.most_common(10)

    # 5. Top 10 emoji users
    top_emoji_users = user_emoji_counts.most_common(10)

    # 6. Top 10 image senders
    top_image_senders = user_image_counts.most_common(10)

    # --- Special Rankings ---
    
    # Night Owls
    top_night_owls = get_top_10(night_owl_counts)
    
    # Morning Person
    top_morning_persons = get_top_10(morning_person_counts)
    
    # Most Replied To
    top_replied_to = get_top_10(replied_to_counts)
    
    # Most Reels Sent
    top_reels_sent = get_top_10(user_reels_sent)
    
    # Longest Word Sent (Top 10 users by longest word length)
    longest_word_list = [{"user": u, "word": d["word"], "length": d["length"]} for u, d in user_longest_words.items()]
    top_longest_words = sorted(longest_word_list, key=lambda x: x['length'], reverse=True)[:10]
    
    # Most Aura (Likes Received / Messages Sent)
    # Higher Ratio = Better Aura (More likes per message)
    aura_scores = []
    for user in user_messages_sent:
        sent = user_messages_sent[user]
        received = user_likes_received[user]
        
        # Filter out low activity users
        if sent < 10:
            continue
            
        # Formula: Received / Sent
        ratio = received / sent
             
        aura_scores.append([user, ratio])
        
    # Sort by ratio DESCENDING (Highest Ratio First)
    top_aura = sorted(aura_scores, key=lambda x: x[1], reverse=True)[:10]
    
    # Most Messages Liked (Likes Given)
    top_messages_liked = get_top_10(user_likes_given)

    # Construct final stats object (Original)
    stats = {
        "top_words_per_user": top_words_per_user,
        "top_words_overall": top_words_overall,
        "top_liked_messages": top_liked_messages,
        "top_emojis": top_emojis,
        "top_emoji_users": top_emoji_users,
        "top_image_senders": top_image_senders
    }

    # Construct rankings object (New)
    rankings = {
        "night_owls": top_night_owls,
        "morning_person": top_morning_persons,
        "most_replied_to": top_replied_to,
        "most_reels_sent": top_reels_sent,
        "longest_word_sent": top_longest_words,
        "most_aura": top_aura,
        "most_messages_liked": top_messages_liked,
        "most_profanity": get_top_10(user_profanity_counts)
    }

    # --- Generate Network Data ---
    participants = sorted(list(user_messages_sent.keys()))
    nodes = [{"id": p} for p in participants]
    links = []
    
    # Calculate combined likes and ratios for all pairs
    pair_data = []
    for i in range(len(participants)):
        for j in range(i + 1, len(participants)):
            p1 = participants[i]
            p2 = participants[j]
            combined_likes = likes_matrix[p1][p2] + likes_matrix[p2][p1]
            combined_likes_given = user_likes_given[p1] + user_likes_given[p2]
            
            if combined_likes > 0 and combined_likes_given > 0:
                ratio = combined_likes / combined_likes_given
                pair_data.append({
                    "source": p1,
                    "target": p2,
                    "value": combined_likes,
                    "ratio": ratio
                })
    
    if pair_data:
        # Sort ratios to find quantile thresholds
        all_ratios = sorted([p['ratio'] for p in pair_data])
        num_links = len(all_ratios)
        
        # Thresholds for 3 even levels (tertiles)
        low_thresh = all_ratios[num_links // 3]
        med_thresh = all_ratios[(2 * num_links) // 3]
        
        for p in pair_data:
            if p['ratio'] <= low_thresh:
                p['strength'] = "Low"
            elif p['ratio'] <= med_thresh:
                p['strength'] = "Medium"
            else:
                p['strength'] = "High"
            links.append(p)

    network_data = {
        "nodes": nodes,
        "links": links
    }

    return {
        "stats": stats,
        "rankings": rankings,
        "network_data": network_data
    }

if __name__ == "__main__":
    # This block would typically be removed or adapted for a web server.
    # For local testing, you might simulate files_data:
    # Example:
    # with open('message_1.json', 'r', encoding='utf-8') as f:
    #     file_content = f.read()
    # simulated_files_data = [{'content': file_content}]
    # results = process_uploaded_data(simulated_files_data)
    # print(json.dumps(results, indent=2, ensure_ascii=False))

    # Original local file processing logic (now commented out or removed)
    # Find all message_*.json files
    files = glob.glob('message_*.json')
    
    if not files:
        print("No message_*.json files found.")
    else:
        print(f"Found {len(files)} files to process for local execution.")
        simulated_files_data = []
        for file_path in files:
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    simulated_files_data.append({'content': f.read()})
            except Exception as e:
                print(f"Error reading local file {file_path}: {e}")
        
        if simulated_files_data:
            results = process_uploaded_data(simulated_files_data)
            # For local execution, you might still want to save the results
            with open('stats.json', 'w', encoding='utf-8') as f:
                json.dump(results['stats'], f, indent=2, ensure_ascii=False)
            print("Stats saved to stats.json")
            with open('rankings.json', 'w', encoding='utf-8') as f:
                json.dump(results['rankings'], f, indent=2, ensure_ascii=False)
            print("Rankings saved to rankings.json")
            with open('network_data.json', 'w', encoding='utf-8') as f:
                json.dump(results['network_data'], f, indent=2, ensure_ascii=False)
            print("Network data saved to network_data.json")
