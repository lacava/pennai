package org.epistasis.symod.tree;

import java.util.List;

/**
 * Function node which returns the value of its first child node. This is used as a NOP in full-tree contexts.
 */
public class PickLeftNode extends ShortCircuitBinaryFuncNode {
	/**
	 * Evaluate the subtree rooted at this node for the input values in the variables array.
	 * @param variables input values for subtree
	 * @return value of subtree for input values
	 */
	@Override
	public double evaluate(final List<Node> children, final double[] variables) {
		return children.get(0).evaluate(variables);
	}
}
