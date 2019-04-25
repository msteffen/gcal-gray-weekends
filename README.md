### A chrome extension that colors weekends gray in Google calendar

![Screenshot of the extension](images/screenshot.png)

This is still very basic. If anybody else ever uses it, I might try to add a
color picker or something (or let you customize which days are colored
differently, in case you work a four-day week or something)

- Not knowing much about JS or Chrome plugins, I borrowed the basic structure
  for this from https://github.com/imightbeamy/gcal-multical-event-merge
- The only elements that need to be modified are the ones with a `data-datekey`
  property, which basically correspond to a single day (there are a few headers
  that this colors as well, since I think it looks a little nicer)
- The most interesting part of this whole project has been figuring out how the
  `data-datekey` property works. It represents a date as mixed-radix number
  of the form `Y*512 + M*32 + D`
    - it uses 1/1/1970 as epoch, so given a `data-datekey = N = Y*512 + M*32 +
      D"`, the actual date corresponding to `N` is `D/M/1970+Y`
    - The lowest value of `data-datekey`, not surprisingly, is for 1/1/1970,
      though if you navigate there, you'll see that it has `data-datekey="33"`,
      rather than `"0"`, corresponding to `M = 1, D = 1, Y = 0 => 512*0 + 32*1
      + 1 = 33`
    - Dates before 1/1/1970 are represented using a negative `data-datekey`. The
      largest such value `12/31/1969 = 512*-1 + 32*12 + 31 = -97`
    - Moreover, having every radix be a power of 2 means that `data-datekey` can
      be converted to M/D/Y using only bitwise operators (shifts and masks)

Personal note: I also realized as part of this that dividing by 512 using `>>9`
actually "fixes" division. If we define the integral quotient `X/Y` to be
largest integer Z such that `Z*Y < X`, then `-1/512 = -1`, as returned by
`-1>>9` but not by `-1/512`. If `/` worked this way as well, then `X%Y` would
never be negative (but we'd still have `Y*(X/Y) + (X%Y) = X`, which requires
`X%Y` to be negative given the current convention for `/`). This would have
avoided a lot of array indexing bugs that I've written in my life
