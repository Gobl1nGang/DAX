import json
import re
from collections import defaultdict, Counter
from datetime import datetime, timezone, timedelta

def fix_text(text):
    if not isinstance(text, str):
        return text
    try:
        return text.encode('latin1').decode('utf-8')
    except (UnicodeEncodeError, UnicodeDecodeError):
        try:
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
    """
    files_data: list of dicts, each containing 'filename' and 'content' (JSON string)
    """
    # Data structures for stats
    user_word_counts = defaultdict(Counter)
    total_word_counts = Counter()
    messages_with_likes = []
    emoji_counts = Counter()
    user_emoji_counts = Counter()
    user_image_counts = Counter()

    # Special Rankings Data
    all_messages = []
    user_likes_received = Counter()
    user_messages_sent = Counter()
    user_reels_sent = Counter()
    user_longest_words = defaultdict(lambda: {"word": "", "length": 0})
    user_likes_given = Counter()
    likes_matrix = defaultdict(lambda: defaultdict(int))
    
    emoji_pattern = re.compile(r'[\U00010000-\U0010ffff]', flags=re.UNICODE)
    profanity_patterns = [
        re.compile(r'\b[fF]+[uU]+[cC]+[kK]+[a-zA-Z]*\b'),
        re.compile(r'\b[sS]+[hH]+[iI]+[tT]+[a-zA-Z]*\b'),
        re.compile(r'\b[bB]+[iI]+[tT]+[cC]+[hH]+[a-zA-Z]*\b'),
        re.compile(r'\b[dD]+[aA]+[mM]+[nN]+[a-zA-Z]*\b'),
        re.compile(r'\b[aA]+[sS]+[sS]+[a-zA-Z]*\b'),
        re.compile(r'\b[hH]+[eE]+[lL]+[lL]+[a-zA-Z]*\b')
    ]
    user_profanity_counts = Counter()

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
                
                if 'timestamp_ms' in message:
                    message['sender_name'] = sender
                    all_messages.append(message)

                if 'content' in message:
                    content = fix_text(message['content'])
                    raw_words = content.split()
                    non_url_words = [w for w in raw_words if not is_url(w)]
                    
                    processed_words = []
                    for w in non_url_words:
                        for pattern in profanity_patterns:
                            if pattern.match(w):
                                user_profanity_counts[sender] += 1
                                break

                        cleaned = re.sub(r'[^\w\s]', '', w.lower())
                        if cleaned:
                            processed_words.append(cleaned)
                    
                    user_word_counts[sender].update(processed_words)
                    total_word_counts.update(processed_words)
                    
                    for word in non_url_words:
                        clean_word = re.sub(r'^[^\w]+|[^\w]+$', '', word)
                        if re.match(r'^[a-zA-Z]+$', clean_word):
                            if len(clean_word) > user_longest_words[sender]["length"]:
                                user_longest_words[sender] = {"word": clean_word, "length": len(clean_word)}

                    emojis = emoji_pattern.findall(content)
                    if emojis:
                        emoji_counts.update(emojis)
                        user_emoji_counts[sender] += len(emojis)
                    
                    if "instagram.com/reel" in content:
                        user_reels_sent[sender] += 1
                    elif 'share' in message and 'link' in message['share'] and "instagram.com/reel" in message['share']['link']:
                         user_reels_sent[sender] += 1

                if 'reactions' in message:
                    like_count = len(message['reactions'])
                    if like_count > 0:
                        user_likes_received[sender] += like_count
                        for reaction in message['reactions']:
                            if 'actor' in reaction:
                                actor = fix_text(reaction['actor'])
                                user_likes_given[actor] += 1
                                likes_matrix[actor][sender] += 1
                        
                        msg_info = {
                            "content": message.get('content', '[Media/No Content]'),
                            "sender": sender,
                            "likes": like_count,
                            "timestamp": message.get('timestamp_ms', 0)
                        }
                        messages_with_likes.append(msg_info)

                if 'photos' in message or 'videos' in message or 'sticker' in message or 'gifs' in message:
                     user_image_counts[sender] += 1
        except Exception as e:
            print(f"Error processing file: {e}")

    # Compile Stats
    all_messages.sort(key=lambda x: x.get('timestamp_ms', 0))
    night_owl_counts = Counter()
    morning_person_counts = Counter()
    replied_to_counts = Counter()
    pst_tz = timezone(timedelta(hours=-8))

    for i, msg in enumerate(all_messages):
        sender = msg.get('sender_name')
        ts_ms = msg.get('timestamp_ms', 0)
        dt = datetime.fromtimestamp(ts_ms / 1000.0, tz=pst_tz)
        hour = dt.hour
        if 0 <= hour < 5:
            night_owl_counts[sender] += 1
        elif 6 <= hour < 12:
            morning_person_counts[sender] += 1
        
        if i < len(all_messages) - 1:
            next_msg = all_messages[i+1]
            next_ts = next_msg.get('timestamp_ms', 0)
            next_sender = next_msg.get('sender_name')
            if next_sender != sender:
                time_diff = (next_ts - ts_ms) / 1000.0
                if time_diff < 300:
                    replied_to_counts[sender] += 1

    def get_top_10(counter_obj):
        return counter_obj.most_common(10)

    top_words_per_user = {u: c.most_common(10) for u, c in user_word_counts.items()}
    top_words_overall = total_word_counts.most_common(10)
    top_liked_messages = sorted(messages_with_likes, key=lambda x: x['likes'], reverse=True)[:10]
    top_emojis = emoji_counts.most_common(10)
    top_emoji_users = user_emoji_counts.most_common(10)
    top_image_senders = user_image_counts.most_common(10)

    # Special Rankings
    aura_scores = []
    for user in user_messages_sent:
        sent = user_messages_sent[user]
        received = user_likes_received[user]
        if sent >= 10:
            aura_scores.append([user, received / sent])
    top_aura = sorted(aura_scores, key=lambda x: x[1], reverse=True)[:10]

    rankings = {
        "night_owls": get_top_10(night_owl_counts),
        "morning_person": get_top_10(morning_person_counts),
        "most_replied_to": get_top_10(replied_to_counts),
        "most_reels_sent": get_top_10(user_reels_sent),
        "longest_word_sent": sorted([{"user": u, "word": d["word"], "length": d["length"]} for u, d in user_longest_words.items()], key=lambda x: x['length'], reverse=True)[:10],
        "most_aura": top_aura,
        "most_messages_liked": get_top_10(user_likes_given),
        "most_profanity": get_top_10(user_profanity_counts)
    }

    # Network Data
    participants = sorted(list(user_messages_sent.keys()))
    nodes = [{"id": p} for p in participants]
    links = []
    pair_data = []
    for i in range(len(participants)):
        for j in range(i + 1, len(participants)):
            p1, p2 = participants[i], participants[j]
            combined_likes = likes_matrix[p1][p2] + likes_matrix[p2][p1]
            combined_likes_given = user_likes_given[p1] + user_likes_given[p2]
            if combined_likes > 0 and combined_likes_given > 0:
                ratio = combined_likes / combined_likes_given
                pair_data.append({"source": p1, "target": p2, "value": combined_likes, "ratio": ratio})
    
    if pair_data:
        all_ratios = sorted([p['ratio'] for p in pair_data])
        num_links = len(all_ratios)
        low_thresh = all_ratios[num_links // 3]
        med_thresh = all_ratios[(2 * num_links) // 3]
        for p in pair_data:
            p['strength'] = "Low" if p['ratio'] <= low_thresh else ("Medium" if p['ratio'] <= med_thresh else "High")
            links.append(p)

    return {
        "stats": {
            "top_words_per_user": top_words_per_user,
            "top_words_overall": top_words_overall,
            "top_liked_messages": top_liked_messages,
            "top_emojis": top_emojis,
            "top_emoji_users": top_emoji_users,
            "top_image_senders": top_image_senders
        },
        "rankings": rankings,
        "network": {"nodes": nodes, "links": links}
    }
