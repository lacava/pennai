# William La Cava
# mock experiment for comparing recommenders.
import pdb
import pandas as pd
import numpy as np
import argparse
from ai.recommender.average_recommender import AverageRecommender
from ai.recommender.random_recommender import RandomRecommender
# define a comparison function that tests a recommender on the pmlb datasets, 
#using an intial knowledge base.
def run_experiment(rec,data_idx,n_recs,trial,pmlb_data,pmlb_file,n_init):
    """generates recommendations for datasets, using the first 10 as knowledge base."""
    results = []
    recommender = {'random': RandomRecommender(pmlb_file=pmlb_file,metric='bal_accuracy'),
            'average': AverageRecommender(metric='bal_accuracy')
            }[rec]
    #pdb.set_trace()
    # load first ten results into recommender
    train_subset = [d for i,d in enumerate(data_idx) if i < n_init]
    print('setting training data for recommender:',train_subset)
    for i in train_subset:
        recommender.update(pmlb_data.loc[pmlb_data['dataset']==i])
    rec_subset = [d for i,d in enumerate(data_idx) if i >= n_init]
    # loop thru rest of datasets
    for it,dataset in enumerate(rec_subset):

        holdout_subset_lookup = pmlb_data.loc[pmlb_data['dataset'] == dataset].set_index(
            ['algorithm', 'parameters']).loc[:, 'bal_accuracy'].to_dict()
        print('generating recommendation for',dataset)
        for i in np.arange(n_recs):
            ml ='adf'
            p = 'pakd'
            n = 0
            while (ml,p) not in holdout_subset_lookup and n<1000:
                # for each dataset, generate a recommendation
                ml, p, scores = recommender.recommend(n_recs=1, dataset_id=dataset)
                #pdb.set_trace()
                ml = ml[0]
                p = p[0]
                print('recommending',ml,p,'for',dataset)               
                n = n+1
            # retreive the performance of the recommended learner
            actual_score = holdout_subset_lookup[(ml, p)]

            # Update the recommender with the score from its latest guess
            update_record = pd.DataFrame(data={'dataset': [dataset],
                                               'algorithm': [ml],
                                               'parameters': [p],
                                               'bal_accuracy': [actual_score]})
            recommender.update(update_record)
            # store the trial, iteration, dataset, recommender, ml rec, param rec, bal_accuracy	
            results.append([trial,it,rec,dataset,ml,p,actual_score])

    return results

# make a figure comparing several runs of the test over different orderings of datasets

if __name__ == '__main__':
    """run experiment"""

    parser = argparse.ArgumentParser(description='Run a PennAI a recommender experiment.', 
                                     add_help=False)
    parser.add_argument('-h','--help',action='help',
                        help="Show this help message and exit.")
    parser.add_argument('-recs',action='store',dest='rec',default='random,average', 
                        help='Comma-separated list of recommenders to run.') 
    parser.add_argument('-n_recs',action='store',dest='n_recs',type=int,default=10,help='Number of '
                        ' recommendations to make at a time. If zero, will send continous '
                        'recommendations until AI is turned off.')
    parser.add_argument('-v','-verbose',action='store_true',dest='verbose',default=False,
                        help='Print out more messages.')
    parser.add_argument('-n_trials',action='store',dest='n_trials',type=int,default=20,
                        help='Number of repeat experiments to run.')  
    parser.add_argument('-n_init',action='store',dest='n_init',type=int,default=10,
                        help='Number of initial datasets to seed knowledge database')
    args = parser.parse_args()
    
    pmlb_file = 'metalearning/sklearn-benchmark5-data-mock_experiment.tsv.gz'
    # load pmlb data
    print('load pmlb data')
    pmlb_data = pd.read_csv(pmlb_file,
                            compression='gzip', sep='\t').fillna('')#,
                          
    # dictionary of default recommenders to choose from at the command line. 
    name_to_rec = {'random': RandomRecommender(pmlb_file=pmlb_file,metric='bal_accuracy'),
            'average': AverageRecommender(metric='bal_accuracy')
            }
    data_idx = np.unique(pmlb_data['dataset'])  # datasets 
    # output file
    out_file = ('experiment_' + '-'.join(args.rec.split(',')) 
                + '_' + str(args.n_recs) 
                + 'recs_' + str(args.n_trials) 
                + 'trials_' + str(args.n_init) + 'init.csv')    
    with open(out_file,'w') as out: # write header
        out.write('trial\titeration\trecommender\tdataset\tml-rec\tp-rec\tbal_accuracy\n')

    for t in np.arange(args.n_trials):   # for each trial (parallelize this)
        print('trial',t)
        np.random.shuffle(data_idx) # shuffle datasets
        for rec in args.rec.split(','):        # for each recommender
            print('rec',rec)
            # run experiment
            results = run_experiment(rec,data_idx,args.n_recs,t,pmlb_data,pmlb_file,args.n_init)
    
            with open(out_file,'a') as out:     # printout results
                for res in results:
                    out.write('\t'.join([str(r) for r in res])+'\n')


