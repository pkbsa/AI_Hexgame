/*
Disjoint Set Union (“DSU”)  is the Data Structure: disjoint-set data structure
is a data structure that keeps track of a set of elements partitioned into a
number of disjoint (non-overlapping) subsets.
Union Find is the Algorithm: A union-find algorithm is an algorithm that can
be used to detect cycles in an undirected graph & performs two useful operations
 on such a data structure:

1) Find: Determine which subset a particular element is in. This can be used
for determining if two elements are in the same subset.
2) Union: Join two subsets into a single subset.

Source: https://gist.github.com/KSoto/3300322fc2fb9b270dce2bf1e3d80cf3
*/

class DSU {
  constructor() {
    this.parents = [];
  }
  find(x) {
    if (typeof this.parents[x] != "undefined") {
      if (this.parents[x] < 0) {
        return x; //x is a parent
      } else {
        //recurse until you find x's parent
        return this.find(this.parents[x]);
      }
    } else {
      // initialize this node to it's on parent (-1)
      this.parents[x] = -1;
      return x; //return the index of the parent
    }
  }
  union(x, y) {
    var xpar = this.find(x);
    var ypar = this.find(y);
    if (xpar != ypar) {
      // x's parent is now the parent of y also.
      // if y was a parent to more than one node, then
      // all of those nodes are now also connected to x's parent.
      this.parents[xpar] += this.parents[ypar];
      this.parents[ypar] = xpar;
      return false;
    } else {
      return true; //this link creates a cycle
    }
  }
}
