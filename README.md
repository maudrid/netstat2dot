# netstat2dot
Converts "netstat -tn" output to dot format for usage in Graphviz.

This is a quick and dirty program that makes a few assumptions for example:
that listening ports are less than 5 characters long. But it works in most cases.
The main bennefit of this app, is that you don't need to install anything on the
servers that you want to diagram. Most servers have `netstat` already installed.

Hint: You can put the output of several servers' `netstat` results in the same input file.

```
Usage:
node netstat2dot.js FILE [-fl=FILTER] [-ff=FILTER]
Options:
  -fl: Filter Local Address. Provide a partial to filter local addresses.
    Example: "-fl=192.168" will only add local addresses that start with "192.168"
    to be added to the diagram.
  -ff: Filter Foreign Address. Provide a partial to filter foreign addresses.
    Same as -fl but for foreign addresses.

Example:
 netstat -tn > netstat.out
 node netstat2dot.js netstat.out -fl=192.169.0 -ff=172.16 > diagram.dot
 dot -Tsvg diagram.dot > diagram.svg
```
Sample graph:
![Sample Graph](https://raw.githubusercontent.com/maudrid/netstat2dot/main/sample-output.svg)
