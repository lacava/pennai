#!/usr/bin/python3
import numpy as np
import json
import pycurl
import time
import argparse
import requests
import os
from requests_toolbelt.multipart.encoder import MultipartEncoder

basedir = '/share/devel/Gp/learn/metaga/'
tmpdir = basedir + 'tmp/'
param_batch_json = tmpdir + 'batch.json'
args_list = ["population_size", "generations",
             "crossover_rate", "mutation_rate", "tournsize"]
if not os.path.exists(tmpdir):
    os.makedirs(tmpdir)

#lab_host = os.environ['LAB_HOST']
# change the problem id to different problem
project_id = '57ffd3c1fa76cb0022258722'
baseuri = 'http://lab:5080/api/v1/projects/' + project_id + '/batch'
expbase = 'http://lab:5080/api/v1/batches/'


def SymbReg_FGlab_submit(population):
    """
    Population: A list of individual
    """
    # Parse arguments
    parser = argparse.ArgumentParser("Perform lower level deapGP")
    parser.add_argument('--_id', dest='_id', default=None)
    # a file has all the individual (params_set)

    param_list_file = open(param_batch_json, 'w')
    param_list_file.write('[')
    # make json file for batch submittion
    num_ind = len(population)
#    params = vars(parser.parse_args())
    inpos = 1
    for individual in population:
        param_list_file.write('{')
        for key in range(len(args_list)):
            param_list_file.write("\"{}\" : \"{}\", ".format(
                args_list[key], str(individual[key])))
        param_list_file.write("\"{}\" : \"{}\" ".format('random_state', '42'))
        if inpos < num_ind:
            param_list_file.write('},\n')
            inpos += 1
        else:
            param_list_file.write('}')
    param_list_file.write(']\n')
    param_list_file.close()

    headers = {'Accept': 'application/json',
               'Content-Type': 'application/json'}
    response = requests.post(baseuri, data=open(
        param_batch_json, 'rb'), headers=headers)
    # check after 5 seconds
    time.sleep(5)

    json_data = response.json()
    # get batch ID
    batch_id = json_data['_id']
    # initial status
    exp_status = 'init'
    # batch URI
    batchuri = expbase + batch_id
    nofinished = 0
    while (exp_status != 'success' and num_ind != nofinished):
        exp_response = requests.get(batchuri)
        exp_data = exp_response.json()
        exp_status = exp_data['_status']
        exps = exp_data['_experiments']
        # reset nofinished
        nofinished = 0
        for exp_ind in exps:
            if 'best_fitness_score' in exp_ind:
                nofinished += 1
        if exp_status == 'success' or num_ind == nofinished:
            break
        if exp_status == 'running':
            time.sleep(2)  # check every 2 seconds
        if exp_status == 'fail':
            break
    # rebuild population based on experiments
    fitnesses = []
    for experiment, individual in zip(exp_data['_experiments'], population):
        tmpdict = experiment['_options']
        for key in range(len(args_list)):
            individual[key] = tmpdict[args_list[key]]
        fitnesses.append(experiment['best_fitness_score'])
    os.system('rm -f {}/batch.json'.format(tmpdir))
    return population, fitnesses
