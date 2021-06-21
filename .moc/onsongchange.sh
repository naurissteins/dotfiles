#!/usr/bin/bash

####################################################################
#                    MOC CONFIG FILE
####################################################################
#     %a artist
#     %r album
#     %f filename
#     %t title
#     %n track
#     %d file duration in XX:YY form
#     %D file duration, number of seconds
#
#     OnSongChange="/home/YOU/.moc/onsongchange.sh %a %t %r %f"
#
#     Note:Use the %f in the end for especial cases.
####################################################################



# Get name of fifo file. Internal.

FIFO=$(moc_notify -f)


# Check if moc_notify is running.

if [ ! -e "$FIFO" ]; then
    exit 1
fi

ARTIST="$1"

TITLE="$2"

ALBUM="$3"

FILE="$4"

FOLDER="${FILE%/*}"

ICON="$FOLDER/Folder.jpg"


# Check if not exist image file.

# Try .jpg first
if [ ! -e "$ICON" ]; then

    # Try .png
    ICON=${ICON%.jpg}.png

    if [ ! -e "$ICON" ]; then

        # Set default image
        ICON="audio-x-generic"
    fi

fi

# PRINTF
#
# - Delimiter character:
#      By default '@'
#
# - Format:
#      printf "title @ body @ icon" > $FIFO
#      printf "title @ body \r newline @ icon" > $FIFO

# - Note:
#       Use \r for newline.
#       Do not use \n
#
# - "I do not want that (@) delimiter in my script. How I can change it?"
#       Run:
#           MOC_NOTIFY_DELIM="?" moc_notify &


# Check if empty

if [ -z "$ARTIST" ] || [ -z "$TITLE" ] || [ -z "$ALBUM" ]; then

    SONG_NAME=${FILE##*/}

    printf "Music On Console@$SONG_NAME@$ICON" > "$FIFO"

else

    printf "$ARTIST@$TITLE\r$ALBUM@$ICON" > "$FIFO"

fi

exit $?
# vim: set ts=4 sw=4 tw=500 et :
