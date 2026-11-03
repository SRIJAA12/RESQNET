pipeline {
    agent any

    options {
        timestamps()
        disableConcurrentBuilds()
    }

    environment {
        DOCKER = '/usr/local/bin/docker'
        BACKEND_IMAGE = 'resqnet-backend-ci:latest'
        POSTGIS_CONTAINER = 'resqnet-jenkins-postgis'
        ANSIBLE_DIR = '/opt/resqnet-ansible'
    }

    stages {
        stage('Checkout') {
            steps {
                echo 'Source code is checked out by Jenkins SCM.'

                sh '''
                    set -e

                    echo "Workspace: ${WORKSPACE}"

                    test -f "${WORKSPACE}/backend/requirements.txt"
                    test -f "${WORKSPACE}/compose.yaml"
                    test -f "${WORKSPACE}/backend/Dockerfile"
                    test -f "${WORKSPACE}/Jenkinsfile"

                    echo "Project files verified."
                '''
            }
        }

        stage('Backend Tests') {
            steps {
                sh '''
                    set -e

                    echo "Removing any previous PostGIS test container..."
                    ${DOCKER} rm -f ${POSTGIS_CONTAINER} 2>/dev/null || true

                    echo "Starting PostGIS test database..."
                    ${DOCKER} run -d \
                        --name ${POSTGIS_CONTAINER} \
                        -e POSTGRES_USER=resqnet_test_user \
                        -e POSTGRES_PASSWORD=resqnet_test_password \
                        -e POSTGRES_DB=resqnet_test_db \
                        postgis/postgis:16-3.4

                    echo "Waiting for PostGIS..."
                    READY=0

                    for i in $(seq 1 30); do
                        if ${DOCKER} exec ${POSTGIS_CONTAINER} \
                            pg_isready -U resqnet_test_user -d resqnet_test_db; then
                            READY=1
                            break
                        fi
                        sleep 2
                    done

                    if [ "$READY" -ne 1 ]; then
                        echo "PostGIS did not become ready."
                        ${DOCKER} logs ${POSTGIS_CONTAINER}
                        exit 1
                    fi

                    echo "Building backend test image..."
                    ${DOCKER} build \
                        --tag ${BACKEND_IMAGE} \
                        --file "${WORKSPACE}/backend/Dockerfile.ci" \
                        "${WORKSPACE}/backend"

                    echo "Running backend tests..."
                    ${DOCKER} run --rm \
                        --network container:${POSTGIS_CONTAINER} \
                        -e TEST_DATABASE_URL=postgresql://resqnet_test_user:resqnet_test_password@127.0.0.1:5432/resqnet_test_db \
                        -e DATABASE_URL=postgresql://resqnet_test_user:resqnet_test_password@127.0.0.1:5432/resqnet_test_db \
                        -e ENVIRONMENT=testing \
                        -e DEBUG=true \
                        ${BACKEND_IMAGE}
                '''
            }

            post {
                always {
                    sh '''
                        ${DOCKER} rm -f ${POSTGIS_CONTAINER} 2>/dev/null || true
                    '''
                }
            }
        }

        stage('Build Docker Images') {
            steps {
                sh '''
                    set -e

                    echo "Building RESQNET application images..."
                    ${DOCKER} compose \
                        -f "${WORKSPACE}/compose.yaml" \
                        build backend frontend

                    echo "Docker images built successfully."
                '''
            }
        }

        stage('Deploy with Ansible') {
            steps {
                sh '''
                    set -e

                    echo "Running Ansible deployment..."

                    test -f "${ANSIBLE_DIR}/deploy.yml"

                    cd "${ANSIBLE_DIR}"

                    WORKSPACE="${WORKSPACE}" \
                    ${DOCKER} --version

                    ansible-playbook deploy.yml \
                        -e "project_dir=${WORKSPACE}"
                '''
            }
        }

        stage('Health Check') {
            steps {
                sh '''
                    set -e

                    echo "Checking RESQNET backend health..."

                    for i in $(seq 1 30); do
                        if curl --fail --silent \
                            http://localhost:8001/api/health; then
                            echo
                            echo "Backend health check passed."
                            exit 0
                        fi

                        echo "Waiting for backend..."
                        sleep 5
                    done

                    echo "Backend health check failed."
                    exit 1
                '''
            }
        }
    }

    post {
        success {
            echo 'RESQNET CI/CD pipeline completed successfully.'
        }

        failure {
            echo 'RESQNET CI/CD pipeline failed. Check the stage logs.'
        }

        always {
            echo 'Pipeline execution finished.'
        }
    }
}
