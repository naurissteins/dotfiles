if status is-interactive
    # Commands to run in interactive sessions can go here
end
set fish_greeting ""

export VISUAL=vim;
export EDITOR=vim;

# list
alias ls='exa -1a'
alias ll='exa -BghHliSa'
alias la='exa -BghHlSa'
alias grep='grep --color=auto'
alias egrep='egrep --color=auto'
alias fgrep='fgrep --color=auto'
alias vi='nvim'


# fix obvious typo's
alias cd..='cd ..'
alias pdw="pwd"
alias update='yay -Syyu'

# userlist
alias userlist="cut -d: -f1 /etc/passwd"

