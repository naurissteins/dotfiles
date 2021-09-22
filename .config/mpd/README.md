### Database Updates
MPD should automatically update its database when files in its music directory change. However, I sometimes need to prod it:
```
mpc update
```

### Playlists
MPD has one active playlist at a time, also called the queue. Save the current playlist to a file or load a different playlist:
```
mpc lsplaylists
mpc save myfavorites
mpc load jazz
```
