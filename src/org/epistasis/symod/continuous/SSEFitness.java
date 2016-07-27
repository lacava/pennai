package org.epistasis.symod.continuous;

import org.epistasis.evolutionary.Score;
import org.epistasis.symod.AbstractDataset;
import org.epistasis.symod.AbstractFitnessFunction;
import org.epistasis.symod.AbstractModel;
import org.epistasis.symod.tree.Node;

/**
 * Sum-squared-error fitness function. This function computes the difference between the actual and predicted values for each instance in
 * the data set. It then squares those values and adds them together for the final score.
 */
public class SSEFitness extends AbstractFitnessFunction {
	/**
	 * Create a model object suitable for this fitness function.
	 * @return model object suitable for this fitness function
	 */
	@Override
	public AbstractModel createModel(final Node tree) {
		return new Model(tree);
	}

	/**
	 * Test a given model with a given data set using this fitness function.
	 * @param model model to test
	 * @param data data set for test
	 * @return testing score
	 */
	@Override
	public Score test(final AbstractModel model, final AbstractDataset data) {
		return train(model, data);
	}

	/**
	 * Train a given model with a given data set using this fitness function.
	 * @param model model to train
	 * @param data data set for train
	 * @return training score
	 */
	@Override
	public Score train(final AbstractModel model, final AbstractDataset data) {
		double sse = 0;
		final Node simplifiedTree = model.getTree();
		for (final AbstractDataset.Instance inst : data) {
			final double e = simplifiedTree.evaluate(inst.getValues()) - inst.getStatus().doubleValue();
			sse += e * e;
		}
		return new DoubleScore(sse);
	}
}
