import numpy as np
import pandas as pd
import matplotlib as mpl
mpl.use('Agg')
import matplotlib.pyplot as plt
import os
import json
import itertools
from sklearn import metrics
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import OneHotEncoder, OrdinalEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import make_pipeline
from sklearn.utils import safe_sqr, check_X_y
from mlxtend.evaluate import feature_importance_permutation
from sklearn.externals import joblib
from sklearn import __version__ as skl_version
import warnings
from sys import version
from stopit import threading_timeoutable
import __main__

# if system environment allows to export figures
figure_export = True
if 'MAKEPLOTS' in os.environ:
    if str(os.environ['MAKEPLOTS']) == '1':
        figure_export = True

# if system environment has a random seed
random_state = None
if 'RANDOM_SEED' in os.environ:
    random_state = int(os.environ['RANDOM_SEED'])

#max numbers of bar in importance_score plot and decision tree plot
max_bar_num = 10

# The maximum depth of the decision tree for plot
DT_MAX_DEPTH = 6
if 'DT_MAX_DEPTH' in os.environ:
    DT_MAX_DEPTH = int(os.environ['DT_MAX_DEPTH'])

def balanced_accuracy(y_true, y_pred):
    """Default scoring function: balanced accuracy.
    Balanced accuracy computes each class' accuracy on a per-class basis using a
    one-vs-rest encoding, then computes an unweighted average of the class accuracies.
    Parameters
    ----------
    y_true: numpy.ndarray {n_samples}
            True class labels
    y_pred: numpy.ndarray {n_samples}
            Predicted class labels by the estimator
    Returns
    -------
    fitness: float
            Returns a float value indicating the individual's balanced accuracy
            0.5 is as good as chance, and 1.0 is perfect predictive accuracy
    """
    all_classes = list(set(np.append(y_true, y_pred)))
    all_class_accuracies = []
    for this_class in all_classes:
        this_class_sensitivity = 0.
        this_class_specificity = 0.
        if sum(y_true == this_class) != 0:
            this_class_sensitivity = \
                float(sum((y_pred == this_class) & (y_true == this_class))) /\
                float(sum((y_true == this_class)))

            this_class_specificity = \
                float(sum((y_pred != this_class) & (y_true != this_class))) /\
                float(sum((y_true != this_class)))

        this_class_accuracy = (this_class_sensitivity +
                               this_class_specificity) / 2.
        all_class_accuracies.append(this_class_accuracy)

    return np.mean(all_class_accuracies)


# make new SCORERS
SCORERS = metrics.SCORERS
SCORERS['balanced_accuracy'] = metrics.make_scorer(balanced_accuracy)

@threading_timeoutable(default="Timeout")
def generate_results(model, input_data,
    tmpdir, _id, target_name='class',
    mode='classification', figure_export=figure_export,
    random_state=random_state,
    filename=['test_dataset'],
    categories=None,
    ordinals=None,
    encoding_strategy="OneHotEncoder"
    ):
    """generate reaults for apply a model on a datasetself.
    Parameters
    ----------
    model: scikit-learn Estimator
        a machine learning model with scikit-learn API
    input_data: pandas.Dataframe or list of two pandas.Dataframe
        pandas.DataFrame: PennAI will use train_test_split to make train/test splits
        list of two pandas.DataFrame: The 1st pandas.DataFrame is training dataset,
            while the 2nd one is testing dataset
    target_name: string
        target name in input data
    tmpdir: string
        Path of template directory
    _id: string
        experiment id
    mode:  string
        'classification': Run classification analysis
        'regression': Run regression analysis
    figure_export: boolean
        If figure_export is True, the figures will be exported
    random_state: int
        random seed
    filename: list
        filename for input dataset
    categories: list
        list of column names for one-hot encoding
    ordinals: dict
        keys: categorical feature name(s)
        values: categorical values
    encoding_strategy: string
        encoding strategy for categorical features
    Returns
    -------
    None
    """
    print('loading..')
    if isinstance(input_data, pd.DataFrame):
        feature_names = np.array([x for x in input_data.columns.values if x != target_name])

        features = input_data.drop(target_name, axis=1).values
        target = input_data[target_name].values

        features, target = check_X_y(features, target, dtype=None, order="C", force_all_finite=True)

        training_features, testing_features, training_classes, testing_classes = \
            train_test_split(features, target, random_state=random_state, stratify=input_data[target_name])
    else: # two files for cross-validation
        training_data = input_data[0]
        testing_data = input_data[1]

        feature_names = np.array([x for x in training_data.columns.values if x != target_name])

        training_features = training_data.drop(target_name, axis=1).values
        testing_features = testing_data.drop(target_name, axis=1).values

        training_classes = training_data[target_name].values
        testing_classes = testing_data[target_name].values

        training_features, training_classes = check_X_y(
                                                        training_features,
                                                        training_classes,
                                                        dtype=None, order="C",
                                                        force_all_finite=True)
        testing_features, testing_classes = check_X_y(
                                                        testing_features,
                                                        testing_classes,
                                                        dtype=None, order="C",
                                                        force_all_finite=True)

    # fix random_state
    model = setup_model_params(model, 'random_state', random_state)
    # set class_weight
    model = setup_model_params(model, 'class_weight', 'balanced')

    # use OneHotEncoder or OrdinalEncoder to convert categorical features
    if categories or ordinals:
        transform_cols = []
        feature_names_list = list(feature_names)
        if categories:
            col_idx = get_col_idx(feature_names_list, categories)
            if encoding_strategy == "OneHotEncoder":
                transform_cols.append(("categorical_encoder", OneHotEncoder(), col_idx))
            elif encoding_strategy == "OrdinalEncoder":
                transform_cols.append(("categorical_encoder", OrdinalEncoder(), col_idx))
        if ordinals:
            ordinal_features = sorted(list(ordinals.keys()))
            col_idx = get_col_idx(feature_names_list, ordinal_features)
            ordinal_map = [ordinals[k] for k in ordinal_features]
            transform_cols.append(("ordinalencoder",
                                    OrdinalEncoder(categories=ordinal_map),
                                    col_idx))


        ct = ColumnTransformer(
                                transformers=transform_cols,
                                 remainder='passthrough',
                                 sparse_threshold=0
                                 )
        model = make_pipeline(ct, model)


    print('Args used in model:', model.get_params())

    if mode == "classification":
        scoring = SCORERS["balanced_accuracy"]
        metric = "accuracy"
    else:
        scoring = SCORERS["neg_mean_squared_error"]
        metric = 'r2'
    with warnings.catch_warnings():
        warnings.simplefilter('ignore')
        # fit model
        model.fit(training_features, training_classes)

        # computing cross-validated metrics
        cv_scores = cross_val_score(
                                    estimator=model,
                                    X=training_features,
                                    y=training_classes,
                                    scoring=scoring,
                                    cv=5
                                    )
    # dump fitted module as pickle file
    export_model(tmpdir, _id, model, filename, target_name, random_state)

    # get predicted classes
    predicted_classes = model.predict(testing_features)



    # exporting/computing importance score
    coefs = compute_imp_score(model, metric, training_features, training_classes, random_state)

    feature_importances = {
        'feature_names': feature_names.tolist(),
        'feature_importances': coefs.tolist()
    }

    save_json_fmt(outdir=tmpdir, _id=_id,
                  fname="feature_importances.json", content=feature_importances)
    dtree_test_score = None

    if figure_export:
        top_features, indices = plot_imp_score(tmpdir, _id, coefs, feature_names)
        if not categories and not ordinals:
            dtree_test_score = plot_dot_plot(tmpdir, _id, training_features,
                            training_classes,
                            testing_features,
                            testing_classes,
                            top_features,
                            indices,
                            random_state,
                            mode)

    if mode == 'classification':
        # determine if target is binary or multiclass
        class_names = model.classes_
        if(len(class_names) > 2):
            average = 'macro'
        else:
            average = 'binary'

        testing_classes_encoded = np.array(
                                        [list(model.classes_).index(c)
                                         for c in testing_classes], dtype=np.int
                                         )
        predicted_classes_encoded = np.array(
                                        [list(model.classes_).index(c)
                                         for c in predicted_classes], dtype=np.int
                                         )

        # get metrics and plots
        train_score = SCORERS['balanced_accuracy'](
            model, training_features, training_classes)
        test_score = SCORERS['balanced_accuracy'](
            model, testing_features, testing_classes)
        accuracy_score = balanced_accuracy(testing_classes_encoded, predicted_classes_encoded)
        precision_score = metrics.precision_score(
            testing_classes_encoded, predicted_classes_encoded, average=average)
        recall_score = metrics.recall_score(
            testing_classes_encoded, predicted_classes_encoded, average=average)
        f1_score = metrics.f1_score(
            testing_classes_encoded, predicted_classes_encoded, average=average)
        cnf_matrix = metrics.confusion_matrix(
            testing_classes, predicted_classes, labels=class_names)
        cnf_matrix_dict = {
            'cnf_matrix': cnf_matrix.tolist(),
            'class_names': class_names.tolist()
        }
        save_json_fmt(outdir=tmpdir, _id=_id,
                      fname="cnf_matrix.json", content=cnf_matrix_dict)

        #export plot
        if figure_export:
            plot_confusion_matrix(tmpdir, _id, cnf_matrix, class_names)

        roc_auc_score = 'not supported for multiclass'
        if(average == 'binary'):
            # choose correct scoring function based on model
            try:
                proba_estimates = model.predict_proba(testing_features)[:, 1];
            except AttributeError:
                proba_estimates = model.decision_function(testing_features)

            roc_curve = metrics.roc_curve(testing_classes, proba_estimates)
            roc_auc_score = metrics.roc_auc_score(testing_classes, proba_estimates)

            fpr, tpr, _ = roc_curve
            roc_curve_dict = {
                'fpr': fpr.tolist(),
                'tpr': tpr.tolist(),
                'roc_auc_score': roc_auc_score
            }
            save_json_fmt(outdir=tmpdir, _id=_id,
                          fname="roc_curve.json", content=roc_curve_dict)
            if figure_export:
               plot_roc_curve(tmpdir, _id, roc_curve, roc_auc_score)

        abs_diff_test_score = None
        if dtree_test_score is not None:
            abs_diff_test_score = abs(test_score-dtree_test_score)

        # save metrics
        metrics_dict = {'_scores': {
            'train_score': train_score,
            'test_score': test_score,
            'dtree_test_score': dtree_test_score,
            'abs_diff_test_score': abs_diff_test_score,
            'accuracy_score': accuracy_score,
            'precision_score': precision_score,
            'recall_score': recall_score,
            'f1_score': f1_score,
            'roc_auc_score': roc_auc_score,
            'cv_scores_mean': cv_scores.mean(),
            'cv_scores_std': cv_scores.std(),
            'cv_scores': cv_scores.tolist()
        }
        }
    elif mode == 'regression':
        # get metrics and plots
        train_score = model.score(training_features, training_classes)
        test_score = model.score(testing_features, testing_classes)
        r2_score = metrics.r2_score(testing_classes, predicted_classes)
        mean_squared_error = metrics.mean_squared_error(
            testing_classes, predicted_classes)

        # scatter plot of predicted vs true target values

        abs_diff_test_score = None
        if dtree_test_score is not None:
            abs_diff_test_score = abs(test_score-dtree_test_score)

        # save metrics
        metrics_dict = {'_scores': {
            'train_score': train_score,
            'test_score': test_score,
            'dtree_test_score': dtree_test_score,
            'abs_diff_test_score': abs_diff_test_score,
            'r2_score': r2_score,
            'mean_squared_error': mean_squared_error,
            'cv_scores_mean': cv_scores.mean(),
            'cv_scores_std': cv_scores.std(),
            'cv_scores': cv_scores.tolist()
        }
        }

    save_json_fmt(outdir=tmpdir, _id=_id,
                  fname="value.json", content=metrics_dict)

    prediction_dict = { 'prediction_values' : predicted_classes.tolist() }
    save_json_fmt(outdir=tmpdir, _id=_id,
                  fname="prediction_values.json", content=prediction_dict)


def get_col_idx(feature_names_list, columns):
    """get unique indexes of columns based on list of column names
    Parameters
    ----------

    feature_names_list: list
        list of column names
    columns: list
        list of selected column names

    Returns
    -------
    col_idx: list
        list of selected column indexes
    """
    return [feature_names_list.index(c) for c in columns]


def setup_model_params(model, parameter_name, value):
    """setup parameter in a model.
    Parameters
    ----------

    model: scikit-learn Estimator
        a scikit-learn model
    parameter_name: string
        parameter name in the scikit-learn model
    value: object
        values for assigning to the parameter

    Returns
    -------
    model: scikit-learn Estimator
        a new scikit-learn model with a updated parameter
    """
    # fix random_state
    if hasattr(model, parameter_name):
        setattr(model, parameter_name, value)
    return model


def compute_imp_score(model, metric, training_features, training_classes, random_state):
    """compute importance scores for features.
    If coef_ or feature_importances_ attribute is available for the model,
    the the importance scores will be based on the attribute. If not,
    then permuation importance scores will be estimated
    Parameters
    ----------
    tmpdir: string

    model:  scikit-learn Estimator
        a fitted scikit-learn model
    metric: str, callable
        The metric for evaluating the feature importance through
        permutation. By default, the strings 'accuracy' is
        recommended for classifiers and the string 'r2' is
        recommended for regressors. Optionally, a custom
        scoring function (e.g., `metric=scoring_func`) that
        accepts two arguments, y_true and y_pred, which have
        similar shape to the `y` array.
    training_features: np.darray/pd.DataFrame
        training features
    training_classes: np.darray/pd.DataFrame
        training target
    random_state: int
        random seed for permuation importances

    Returns
    -------
    coefs: np.darray
        feature importance scores

    """
    # exporting/computing importance score
    if hasattr(model, 'coef_'):
        coefs = model.coef_
    else:
        coefs = getattr(model, 'feature_importances_', None)
    if coefs is None:
        coefs, _ = feature_importance_permutation(
                                    predict_method=model.predict,
                                    X=training_features,
                                    y=training_classes,
                                    num_rounds=5,
                                    metric=metric,
                                    seed=random_state,
                                    )

    if coefs.ndim > 1:
        coefs = safe_sqr(coefs).sum(axis=0)

    return coefs


def save_json_fmt(outdir, _id, fname, content):
    """
    Save results into json format.
    Parameters
    ----------
    outdir: string
            path of output directory
    _id: string
            Job ID in FGlab
    fname: string
            file name
    content: list or directory
            content for results
    Returns
    -------
    None
    """
    expdir = outdir + _id + '/'
    with open(os.path.join(expdir, fname), 'w') as outfile:
        json.dump(content, outfile)


def plot_confusion_matrix(tmpdir, _id, cnf_matrix, class_names):
    """
    Make plot for confusion matrix.
    Parameters
    ----------
    tmpdir: string
            path of temporary  output directory
    _id: string
            Job ID in FGlab
    cnf_matrix: np.darray
            confusion matrix
    class_names: list
            class names
    Returns
    -------
    None

    """
    cm = cnf_matrix
    classes = class_names

    np.set_printoptions(precision=2)
    plt.figure()
    plt.imshow(cm, interpolation='nearest', cmap=plt.cm.Blues)
    plt.title('Confusion Matrix')
    tick_marks = np.arange(len(classes))
    plt.xticks(tick_marks, classes, rotation=45)
    plt.yticks(tick_marks, classes)

    thresh = cm.max() / 2.
    for i, j in itertools.product(range(cm.shape[0]), range(cm.shape[1])):
        plt.text(j, i, cm[i, j],
                 horizontalalignment="center",
                 color="gray" if cm[i, j] > thresh else "black")

    plt.subplots_adjust(bottom=0.15)
    plt.ylabel('True label')
    plt.xlabel('Predicted label')
    plt.savefig(tmpdir + _id + '/confusion_matrix_' + _id + '.png')
    plt.close()

# After switching to dynamic charts, possibly disable outputting graphs from this function


def plot_roc_curve(tmpdir, _id, roc_curve, roc_auc_score):
    """
    Plot ROC Curve.
    Parameters
    ----------
    tmpdir: string
            path of temporary  output directory
    _id: string
            Job ID in FGlab
    roc_curve: tuple
            fpr : array, shape = [>2]
                Increasing false positive rates such that element i is the false positive rate of predictions with score >= thresholds[i].
            tpr : array, shape = [>2]
                Increasing true positive rates such that element i is the true positive rate of predictions with score >= thresholds[i].
            thresholds : array, shape = [n_thresholds]
                Decreasing thresholds on the decision function used to compute fpr and tpr. thresholds[0] represents no instances being predicted and is arbitrarily set to max(y_score) + 1.
    roc_auc_score: float
            Compute Area Under the Receiver Operating Characteristic Curve (ROC AUC) from prediction scores.
    Returns
    -------
    None
    """

    fpr, tpr, _ = roc_curve
    plt.figure()
    lw = 2
    plt.plot(fpr, tpr, color='darkorange',
             lw=lw, label='ROC curve (area = %0.2f)' % roc_auc_score)
    plt.plot([0, 1], [0, 1], color='navy', lw=lw, linestyle='--')
    plt.xlim([0.0, 1.0])
    plt.ylim([0.0, 1.05])
    plt.xlabel('False Positive Rate')
    plt.ylabel('True Positive Rate')
    plt.title('ROC Curve')
    plt.legend(loc="lower right")

    plt.savefig(tmpdir + _id + '/roc_curve' + _id + '.png')
    plt.close()


def plot_imp_score(tmpdir, _id, coefs, feature_names):
    """Plot importance scores for features.
    Parameters
    ----------
    tmpdir: string
            path of temporary  output directory
    _id: string
            Job ID in FGlab
    coefs: array
        feature importance scores
    feature_names: np.array
        list of feature names

    Returns
    -------
    top_features: list
        top features with high importance score
    indices: ndarray
        array of indices of top important features

    """
    # plot bar charts for top important features
    num_bar = min(max_bar_num, len(coefs))
    indices = np.argsort(coefs)[-num_bar:]
    h=plt.figure()
    plt.title("Feature importances")
    plt.barh(range(num_bar), coefs[indices], color="r", align="center")
    top_features = list(feature_names[indices])
    plt.yticks(range(num_bar), feature_names[indices])
    plt.ylim([-1, num_bar])
    h.tight_layout()
    plt.savefig(tmpdir + _id + '/imp_score' + _id + '.png')
    plt.close()
    return top_features, indices


def plot_dot_plot(tmpdir, _id, training_features,
                training_classes,
                testing_features,
                testing_classes,
                top_features,
                indices,
                random_state,
                mode):
    """Make dot plot for based on decision tree.
    Parameters
    ----------
    tmpdir: string
            path of temporary  output directory
    _id: string
            Job ID in FGlab
    training_features: np.darray/pd.DataFrame
        training features
    training_classes: np.darray/pd.DataFrame
        training target
    testing_features: np.darray/pd.DataFrame
        testing features
    testing_classes: np.darray/pd.DataFrame
        testing target
    top_features: list
        top feature_names
    indices: ndarray
        array of indices of top important features
    random_state: int
        random seed for permuation importances
    mode:  string
        'classification': Run classification analysis
        'regression': Run regression analysis

    Returns
    -------
    dtree_test_score, float
        test score from fitting decision tree on top important feat'

    """
    # plot bar charts for top important features
    import pydot
    from sklearn.tree import export_graphviz

    top_training_features = training_features[:, indices]
    top_testing_features = testing_features[:, indices]
    if mode == 'classification':
        from sklearn.tree import DecisionTreeClassifier
        dtree=DecisionTreeClassifier(random_state=random_state,
                                max_depth=DT_MAX_DEPTH)
        scoring = SCORERS['balanced_accuracy']
    else:
        from sklearn.tree import DecisionTreeRegressor
        dtree=DecisionTreeRegressor(random_state=random_state,
                                max_depth=DT_MAX_DEPTH)
        scoring = SCORERS["neg_mean_squared_error"]

    dtree.fit(training_features, training_classes)
    dtree_test_score = scoring(
        dtree, top_testing_features, testing_classes)
    dot_file = '{0}{1}/dtree_{1}.dot'.format(tmpdir, _id)
    png_file = '{0}{1}/dtree_{1}.png'.format(tmpdir, _id)
    class_names = None
    if mode == 'classification':
        class_names = [str(i) for i in dtree.classes_]
    export_graphviz(dtree, out_file=dot_file,
                     feature_names=top_features,
                     class_names=class_names,
                     filled=True, rounded=True,
                     special_characters=True)
    (graph,) = pydot.graph_from_dot_file(dot_file)
    graph.write_png(png_file)
    return dtree_test_score



def export_model(tmpdir, _id, model, filename, target_name, random_state=42):
    """export model as a pickle file and generate a scripts for using the pickled model.
    Parameters
    ----------
    tmpdir: string
            path of temporary  output directory
    _id: string
            Job ID in FGlab
    model: scikit-learn estimator
            a fitted scikit-learn model
    filename: string
            file name of input dataset
    target_name: string
        target name in input data
    random_state: int
        random seed

    Returns
    -------
    None
    """
    pickle_file_name = 'model_{}.pkl'.format(_id)
    pickle_file = '{0}{1}/model_{1}.pkl'.format(tmpdir, _id)

    pickle_model = {}
    pickle_model['model'] = model
    pickle_model['data_filename'] = filename
    joblib.dump(pickle_model, pickle_file)
    pipeline_text = generate_export_codes(pickle_file_name, model, filename, target_name, random_state)
    export_scripts = open("{0}{1}/scripts_{1}.py".format(tmpdir, _id), "w")
    export_scripts.write(pipeline_text)
    export_scripts.close()


def generate_export_codes(pickle_file_name, model, filename, target_name, random_state=42):
    """Generate all library import calls for use in stand alone python scripts.
    Parameters
    ----------
    pickle_file_name: string
        a pickle file for a fitted scikit-learn estimator
    Returns
    -------
    pipeline_text: String
       The Python code that imports all required library used in the current
       optimized pipeline
    model: scikit-learn Estimator
        a machine learning model with scikit-learn API
    filename: list
        filename for input dataset
    target_name: string
        target name in input data
    random_state: int
        random seed
    """
    pipeline_text = """# Python version: {python_version}
# Results were generated with numpy v{numpy_version}, pandas v{pandas_version} and scikit-learn v{skl_version}
# random seed = {random_state}
# Training dataset filename = {dataset}
# Pickle filename = {pickle_file_name}
# Model in the pickle file: {model}
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.externals import joblib
from sklearn.utils import check_X_y
from sklearn.metrics import make_scorer

# NOTE: Edit variables below with appropriate values
# path to your pickle file, below is the downloaded pickle file
pickle_file = '{pickle_file_name}'
# file path to the dataset
dataset = '{dataset}'
# target column name
target_column = '{target_name}'
# seed to be used for train_test_split (default in PennAI is 42)
seed = {random_state}

# Balanced accuracy below was described in [Urbanowicz2015]: the average of sensitivity and specificity is computed for each class and then averaged over total number of classes.
# It is NOT the same as sklearn.metrics.balanced_accuracy_score, which is defined as the average of recall obtained on each class.
def balanced_accuracy(y_true, y_pred):
    all_classes = list(set(np.append(y_true, y_pred)))
    all_class_accuracies = []
    for this_class in all_classes:
        this_class_sensitivity = 0.
        this_class_specificity = 0.
        if sum(y_true == this_class) != 0:
            this_class_sensitivity = \\
                float(sum((y_pred == this_class) & (y_true == this_class))) /\\
                float(sum((y_true == this_class)))
            this_class_specificity = \\
                float(sum((y_pred != this_class) & (y_true != this_class))) /\\
                float(sum((y_true != this_class)))
        this_class_accuracy = (this_class_sensitivity +
                               this_class_specificity) / 2.
        all_class_accuracies.append(this_class_accuracy)
    return np.mean(all_class_accuracies)

# load fitted model
pickle_model = joblib.load(pickle_file)
model = pickle_model['model']

# read input data
input_data = pd.read_csv(dataset, sep=None, engine='python')

# Application 1: reproducing training score and testing score from PennAI
features = input_data.drop(target_column, axis=1).values
target = input_data[target_column].values
# Checking dataset
features, target = check_X_y(features, target, dtype=None, order="C", force_all_finite=True)
training_features, testing_features, training_classes, testing_classes = \\
    train_test_split(features, target, random_state=seed, stratify=input_data[target_column])
scorer = make_scorer(balanced_accuracy)
train_score = scorer(model, training_features, training_classes)
print("Training score: ", train_score)
test_score = scorer(model, testing_features, testing_classes)
print("Testing score: ", test_score)


# Application 2: cross validation of fitted model
testing_features = input_data.drop(target_column, axis=1).values
testing_target = input_data[target_column].values
# Get holdout score for fitted model
print("Holdout score: ", end="")
print(model.score(testing_features, testing_target))


# Application 3: predict outcome by fitted model
# In this application, the input dataset may not include target column
input_data.drop(target_column, axis=1, inplace=True) # Please comment this line if there is no target column in input dataset
predict_target = model.predict(input_data.values)
""".format(
            python_version=version.replace('\n', ''),
            numpy_version=np.__version__,
            pandas_version=pd.__version__,
            skl_version=skl_version,
            dataset=",".join(filename),
            target_name=target_name,
            pickle_file_name=pickle_file_name,
            random_state=random_state,
            model=str(model).replace('\n', '\n#')
            )


    return pipeline_text
